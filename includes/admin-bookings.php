<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}


/**
 * Add Oasis Bookings page to WordPress admin.
 */
add_action(
    'admin_menu',
    'oasis_register_bookings_admin_page'
);

/**
 * CSV export handler.
 */
add_action(
    'admin_post_oasis_export_bookings_csv',
    'oasis_export_bookings_csv'
);

function oasis_register_bookings_admin_page() {

    add_menu_page(
        'Oasis Bookings',
        'Oasis Bookings',
        'manage_options',
        'oasis-bookings',
        'oasis_render_bookings_admin_page',
        'dashicons-calendar-alt',
        30
    );
}


/**
 * Render Oasis Bookings admin page.
 */
function oasis_render_bookings_admin_page() {

    /*
     * Refresh stale abandoned bookings before showing the dashboard.
     *
     * The booking engine owns the actual expiry logic. We call it here
     * as an additional safety net so the admin list is current whenever
     * the Oasis Bookings page is opened.
     */
    if ( function_exists( 'oasis_expire_abandoned_bookings' ) ) {
        oasis_expire_abandoned_bookings();
    }

    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'You do not have permission to access this page.' );
    }

    global $wpdb;

    $table_name = $wpdb->prefix . 'oasis_bookings';

    $booking_id = isset( $_GET['booking_id'] )
        ? absint( $_GET['booking_id'] )
        : 0;

    $search = isset( $_GET['s'] )
        ? sanitize_text_field( wp_unslash( $_GET['s'] ) )
        : '';

    $status_filter = isset( $_GET['status'] )
        ? sanitize_key( wp_unslash( $_GET['status'] ) )
        : '';

    $allowed_statuses = array(
        'pending',
        'confirmed',
        'completed',
        'cancelled',
        'expired',
    );

    if ( ! in_array( $status_filter, $allowed_statuses, true ) ) {
        $status_filter = '';
    }

    echo '<div class="wrap">';

    /*
     * ---------------------------------------------------------
     * BOOKING DETAIL
     * ---------------------------------------------------------
     */

    if ( $booking_id ) {

        $booking = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$table_name} WHERE id = %d",
                $booking_id
            )
        );

        if ( ! $booking ) {

            echo '<h1>Oasis Booking</h1>';
            echo '<div class="notice notice-error"><p>Booking not found.</p></div>';
            echo '<p><a href="' . esc_url(
                admin_url( 'admin.php?page=oasis-bookings' )
            ) . '">&larr; Back to Bookings</a></p>';
            echo '</div>';

            return;
        }

        $booking_data = array();

        if ( ! empty( $booking->booking_data ) ) {

            $decoded = json_decode(
                $booking->booking_data,
                true
            );

            if ( is_array( $decoded ) ) {
                $booking_data = $decoded;
            }
        }

        $order = false;

        if (
            ! empty( $booking->woocommerce_order_id ) &&
            function_exists( 'wc_get_order' )
        ) {
            $order = wc_get_order(
                (int) $booking->woocommerce_order_id
            );
        }

        echo '<h1>Oasis Booking</h1>';

        echo '<p>';
        echo '<a href="' . esc_url(
            admin_url( 'admin.php?page=oasis-bookings' )
        ) . '">&larr; Back to Bookings</a>';
        echo '</p>';

        /*
         * Booking / WooCommerce status
         */

        echo '<table class="widefat striped" style="max-width:900px;margin-bottom:20px;">';

        echo '<tbody>';

        oasis_admin_detail_row(
            'Booking Reference',
            $booking->booking_reference
        );

        oasis_admin_detail_row(
            'Oasis Booking Status',
            $booking->booking_status
        );

        if ( $order ) {

            $order_edit_url = admin_url(
                'admin.php?page=wc-orders&action=edit&id=' . $order->get_id()
            );

            oasis_admin_detail_row(
                'WooCommerce Order',
                '<a href="' . esc_url( $order_edit_url ) . '">#' .
                esc_html( $order->get_id() ) .
                '</a>'
            );

            oasis_admin_detail_row(
                'WooCommerce Status',
                wc_get_order_status_name(
                    $order->get_status()
                )
            );

            oasis_admin_detail_row(
                'Payment Status',
                $booking->payment_status
            );
        } else {

            oasis_admin_detail_row(
                'WooCommerce Order',
                'Not linked'
            );

            oasis_admin_detail_row(
                'WooCommerce Status',
                '—'
            );

            oasis_admin_detail_row(
                'Payment Status',
                $booking->payment_status
            );
        }

        echo '</tbody>';
        echo '</table>';


        /*
         * Customer
         */

        $customer = oasis_admin_get_customer_data(
            $booking,
            $booking_data,
            $order
        );

        echo '<h2>Customer</h2>';

        echo '<table class="widefat striped" style="max-width:900px;margin-bottom:20px;">';
        echo '<tbody>';

        oasis_admin_detail_row(
            'Name',
            $customer['name']
        );

        oasis_admin_detail_row(
            'Email',
            $customer['email']
        );

        oasis_admin_detail_row(
            'Contact Number',
            $customer['phone']
        );

        echo '</tbody>';
        echo '</table>';


        /*
         * Trip
         */

        echo '<h2>Trip</h2>';

        echo '<table class="widefat striped" style="max-width:900px;margin-bottom:20px;">';
        echo '<tbody>';

        oasis_admin_detail_row(
            'Booking Type',
            $booking->booking_type
        );

        oasis_admin_detail_row(
            'Service Type',
            $booking->service_type
        );

        oasis_admin_detail_row(
            'Vehicle',
            oasis_admin_vehicle_label(
                $booking->vehicle_key
            )
        );

        oasis_admin_detail_row(
            'Pickup Date / Time',
            oasis_admin_format_datetime(
                $booking->pickup_datetime
            )
        );

        oasis_admin_detail_row(
            'Booking End',
            oasis_admin_format_datetime(
                $booking->booking_end_datetime
            )
        );

        oasis_admin_detail_row(
            'Pickup Type',
            $booking->pickup_type
        );

        oasis_admin_detail_row(
            'Pickup Address',
            oasis_admin_data_value(
                $booking_data,
                array(
                    'pickup_address',
                    'pickup',
                )
            )
        );

        oasis_admin_detail_row(
            'Pickup Suburb',
            oasis_admin_data_value(
                $booking_data,
                array(
                    'pickupSuburb',
                    'pickup_suburb',
                    'pickup_locality',
                )
            )
        );

        oasis_admin_detail_row(
            'Drop-off Type',
            $booking->dropoff_type
        );

        oasis_admin_detail_row(
            'Drop-off Address',
            oasis_admin_data_value(
                $booking_data,
                array(
                    'dropoff_address',
                    'dropoff',
                )
            )
        );

        oasis_admin_detail_row(
            'Drop-off Suburb',
            oasis_admin_data_value(
                $booking_data,
                array(
                    'dropoffSuburb',
                    'dropoff_suburb',
                    'dropoff_locality',
                )
            )
        );

        oasis_admin_detail_row(
            'Flight Number',
            oasis_admin_data_value(
                $booking_data,
                array(
                    'flight_number',
                    'flightNumber',
                )
            )
        );

        echo '</tbody>';
        echo '</table>';


        /*
         * Passenger / luggage
         */

        echo '<h2>Passengers &amp; Luggage</h2>';

        echo '<table class="widefat striped" style="max-width:900px;margin-bottom:20px;">';
        echo '<tbody>';

        oasis_admin_detail_row(
            'Passengers',
            $booking->passengers
        );

        oasis_admin_detail_row(
            'Check-in Bags',
            $booking->check_in_bags
        );

        oasis_admin_detail_row(
            'Small / Carry-on Bags',
            $booking->small_carry_on_bags
        );

        oasis_admin_detail_row(
            'Baby Seats',
            $booking->baby_seats
        );

        oasis_admin_detail_row(
            'Forward-facing / Booster Seats',
            $booking->booster_seats
        );

        oasis_admin_detail_row(
            'Hours',
            $booking->hours
        );

        echo '</tbody>';
        echo '</table>';


        /*
         * Route
         */

        echo '<h2>Route</h2>';

        echo '<table class="widefat striped" style="max-width:900px;margin-bottom:20px;">';
        echo '<tbody>';

        oasis_admin_detail_row(
            'Outbound Distance',
            oasis_admin_number(
                $booking->outbound_distance,
                ' km'
            )
        );

        oasis_admin_detail_row(
            'Return Distance',
            oasis_admin_number(
                $booking->return_distance,
                ' km'
            )
        );

        $duration_minutes = oasis_admin_data_value(
            $booking_data,
            array(
                'routeDurationMinutes',
                'durationMinutes',
                'duration_minutes',
            )
        );

        oasis_admin_detail_row(
            'Duration',
            $duration_minutes !== ''
                ? $duration_minutes . ' minutes'
                : '—'
        );

        echo '</tbody>';
        echo '</table>';


        /*
         * Return trip
         */

        $return_pickup_address = oasis_admin_data_value(
            $booking_data,
            array(
                'return_pickup_address',
                'returnPickupAddress',
            )
        );

        $return_dropoff_address = oasis_admin_data_value(
            $booking_data,
            array(
                'return_dropoff_address',
                'returnDropoffAddress',
            )
        );

        if (
            ! empty( $booking->return_datetime ) ||
            $return_pickup_address !== '' ||
            $return_dropoff_address !== ''
        ) {

            echo '<h2>Return Trip</h2>';

            echo '<table class="widefat striped" style="max-width:900px;margin-bottom:20px;">';
            echo '<tbody>';

            oasis_admin_detail_row(
                'Return Pickup Date / Time',
                oasis_admin_format_datetime(
                    $booking->return_datetime
                )
            );

            oasis_admin_detail_row(
                'Return Pickup Type',
                $booking->return_pickup_type
            );

            oasis_admin_detail_row(
                'Return Pickup Address',
                $return_pickup_address
            );

            oasis_admin_detail_row(
                'Return Drop-off Type',
                $booking->return_dropoff_type
            );

            oasis_admin_detail_row(
                'Return Drop-off Address',
                $return_dropoff_address
            );

            echo '</tbody>';
            echo '</table>';
        }


        /*
         * Pricing
         */

        echo '<h2>Pricing</h2>';

        echo '<table class="widefat striped" style="max-width:900px;margin-bottom:20px;">';
        echo '<tbody>';

        oasis_admin_money_row(
            'Base Fare',
            $booking->base_fare
        );

        oasis_admin_money_row(
            'Distance Fare',
            $booking->distance_fare
        );

        oasis_admin_money_row(
            'Hourly Fare',
            $booking->hourly_fare
        );

        oasis_admin_money_row(
            'Subtotal',
            $booking->subtotal
        );

        oasis_admin_money_row(
            'Tolls',
            $booking->tolls
        );

        oasis_admin_money_row(
            'Parking',
            $booking->parking
        );

        oasis_admin_money_row(
            'Levy',
            $booking->levy
        );

        oasis_admin_money_row(
            'Original Total',
            $booking->total
        );

        oasis_admin_money_row(
            'Coupon Discount',
            isset( $booking->discount_amount )
                ? $booking->discount_amount
                : 0
        );

        oasis_admin_money_row(
            'Final Total',
            isset( $booking->final_total ) &&
            (float) $booking->final_total > 0
                ? $booking->final_total
                : $booking->total
        );

        if ( ! empty( $booking->coupon_codes ) ) {
            oasis_admin_detail_row(
                'Coupon Code',
                $booking->coupon_codes
            );
        }

        echo '</tbody>';
        echo '</table>';


        /*
         * Special instructions
         */

        echo '<h2>Special Instructions</h2>';

        echo '<div style="background:#fff;border:1px solid #ccd0d4;padding:15px;max-width:870px;margin-bottom:20px;">';

        echo nl2br(
            esc_html(
                $booking->special_instructions
            )
        );

        echo '</div>';


        /*
         * Dates
         */

        echo '<h2>Record</h2>';

        echo '<table class="widefat striped" style="max-width:900px;">';
        echo '<tbody>';

        oasis_admin_detail_row(
            'Created',
            oasis_admin_format_datetime(
                $booking->created_at
            )
        );

        oasis_admin_detail_row(
            'Updated',
            oasis_admin_format_datetime(
                $booking->updated_at
            )
        );

        echo '</tbody>';
        echo '</table>';

        echo '</div>';

        return;
    }


    /*
     * ---------------------------------------------------------
     * BOOKING LIST
     * ---------------------------------------------------------
     */

    echo '<h1>Oasis Bookings</h1>';

    echo '<form method="get" style="margin:15px 0;">';

    echo '<input type="hidden" name="page" value="oasis-bookings">';

    echo '<input
        type="search"
        name="s"
        value="' . esc_attr( $search ) . '"
        placeholder="Search booking reference or Woo order"
        style="width:300px;"
    >';

    echo '<select name="status" style="margin-left:6px;">';
    echo '<option value="">Active / All except Expired</option>';

    foreach ( $allowed_statuses as $status_option ) {
        echo '<option value="' . esc_attr( $status_option ) . '"' .
            selected( $status_filter, $status_option, false ) . '>' .
            esc_html( ucfirst( $status_option ) ) .
            '</option>';
    }

    echo '</select>';

    echo '<button type="submit" class="button button-primary" style="margin-left:6px;">Search</button>';

    if ( $search !== '' || $status_filter !== '' ) {

        echo ' <a class="button" href="' .
            esc_url(
                admin_url( 'admin.php?page=oasis-bookings' )
            ) .
            '">Clear</a>';
    }

    echo ' <a class="button" href="' .
        esc_url(
            wp_nonce_url(
                admin_url( 'admin-post.php?action=oasis_export_bookings_csv' ),
                'oasis_export_bookings_csv'
            )
        ) .
        '">Export CSV</a>';

    echo '</form>';


    $where  = array();
    $params = array();

    /*
     * Expired bookings are abandoned-cart records. Keep them in the
     * database, but hide them from the normal operational dashboard.
     */
    if ( $status_filter === '' ) {

        $where[] = "booking_status <> 'expired'";

    } else {

        $where[] = 'booking_status = %s';
        $params[] = $status_filter;
    }

    if ( $search !== '' ) {

        $like = '%' . $wpdb->esc_like( $search ) . '%';

        $where[] = '(
            booking_reference LIKE %s
            OR CAST(woocommerce_order_id AS CHAR) LIKE %s
        )';

        $params[] = $like;
        $params[] = $like;
    }

    $sql = "SELECT *
            FROM {$table_name}
            WHERE " . implode( ' AND ', $where ) . "
            ORDER BY id DESC
            LIMIT 100";

    if ( ! empty( $params ) ) {
        $bookings = $wpdb->get_results(
            $wpdb->prepare( $sql, $params )
        );
    } else {
        $bookings = $wpdb->get_results( $sql );
    }


    if ( empty( $bookings ) ) {

        echo '<p>No bookings found for the selected filters.</p>';

        echo '</div>';

        return;
    }


    echo '<table class="widefat striped">';

    echo '<thead>';
    echo '<tr>';

    echo '<th>Booking</th>';
    echo '<th>Customer</th>';
    echo '<th>Vehicle</th>';
    echo '<th>Pickup</th>';
    echo '<th>Type</th>';
    echo '<th>Booking Status</th>';
    echo '<th>Woo Order</th>';
    echo '<th>Woo Status</th>';
    echo '<th>Final Total</th>';

    echo '</tr>';
    echo '</thead>';

    echo '<tbody>';


    foreach ( $bookings as $booking ) {

        $booking_data = array();

        if ( ! empty( $booking->booking_data ) ) {

            $decoded = json_decode(
                $booking->booking_data,
                true
            );

            if ( is_array( $decoded ) ) {
                $booking_data = $decoded;
            }
        }

        $order = false;

        if (
            ! empty( $booking->woocommerce_order_id ) &&
            function_exists( 'wc_get_order' )
        ) {
            $order = wc_get_order(
                (int) $booking->woocommerce_order_id
            );
        }

        $customer = oasis_admin_get_customer_data(
            $booking,
            $booking_data,
            $order
        );

        $customer_name = $customer['name'];

        $woo_status = '—';

        if ( $order ) {
            $woo_status = wc_get_order_status_name(
                $order->get_status()
            );
        }


        $detail_url = add_query_arg(
            array(
                'page'       => 'oasis-bookings',
                'booking_id' => (int) $booking->id,
            ),
            admin_url( 'admin.php' )
        );


        echo '<tr>';

        echo '<td>';
        echo '<strong><a href="' .
            esc_url( $detail_url ) .
            '">' .
            esc_html( $booking->booking_reference ) .
            '</a></strong>';
        echo '</td>';

        echo '<td>' .
            esc_html(
                $customer_name !== ''
                    ? $customer_name
                    : '—'
            ) .
            '</td>';

        echo '<td>' .
            esc_html(
                oasis_admin_vehicle_label(
                    $booking->vehicle_key
                )
            ) .
            '</td>';

        echo '<td>' .
            esc_html(
                oasis_admin_format_datetime(
                    $booking->pickup_datetime
                )
            ) .
            '</td>';

        echo '<td>' .
            esc_html(
                $booking->booking_type
            ) .
            '</td>';

        echo '<td>' .
            esc_html(
                $booking->booking_status
            ) .
            '</td>';

        echo '<td>';

        if ( ! empty( $booking->woocommerce_order_id ) ) {

            echo '#' .
                esc_html(
                    $booking->woocommerce_order_id
                );

        } else {

            echo '—';
        }

        echo '</td>';

        echo '<td>' .
            esc_html( $woo_status ) .
            '</td>';

        $list_final_total =
            isset( $booking->final_total ) &&
            (float) $booking->final_total > 0
                ? (float) $booking->final_total
                : (float) $booking->total;

        echo '<td>$' .
            esc_html(
                number_format( $list_final_total, 2 )
            ) .
            '</td>';

        echo '</tr>';
    }


    echo '</tbody>';
    echo '</table>';

    echo '<p style="margin-top:10px;color:#666;">Showing the latest 100 bookings. Expired abandoned-cart bookings are hidden by default.</p>';

    echo '</div>';
}


/**
 * Get customer details, preferring the linked WooCommerce order.
 */
function oasis_admin_get_customer_data(
    $booking,
    $booking_data = array(),
    $order = false
) {

    $name  = '';
    $email = '';
    $phone = '';

    if ( $order ) {

        $first_name = trim( (string) $order->get_billing_first_name() );
        $last_name  = trim( (string) $order->get_billing_last_name() );

        $name = trim( $first_name . ' ' . $last_name );
        $email = trim( (string) $order->get_billing_email() );
        $phone = trim( (string) $order->get_billing_phone() );
    }

    if ( $name === '' ) {
        $name = oasis_admin_data_value(
            $booking_data,
            array(
                'customer_name',
                'passenger_name',
                'name',
            )
        );
    }

    if ( $email === '' ) {
        $email = oasis_admin_data_value(
            $booking_data,
            array(
                'email',
                'customer_email',
            )
        );
    }

    if ( $phone === '' ) {
        $phone = oasis_admin_data_value(
            $booking_data,
            array(
                'phone',
                'contact_number',
                'customer_phone',
            )
        );
    }

    return array(
        'name'  => $name,
        'email' => $email,
        'phone' => $phone,
    );
}


/**
 * Admin detail table row.
 */
function oasis_admin_detail_row(
    $label,
    $value
) {

    echo '<tr>';

    echo '<th style="width:220px;">' .
        esc_html( $label ) .
        '</th>';

    echo '<td>' .
        wp_kses_post(
            $value !== ''
                ? $value
                : '—'
        ) .
        '</td>';

    echo '</tr>';
}


/**
 * Admin money row.
 */
function oasis_admin_money_row(
    $label,
    $value
) {

    oasis_admin_detail_row(
        $label,
        '$' . number_format(
            (float) $value,
            2
        )
    );
}


/**
 * Admin number formatter.
 */
function oasis_admin_number(
    $value,
    $suffix = ''
) {

    if (
        $value === null ||
        $value === '' ||
        (float) $value == 0
    ) {
        return '—';
    }

    return number_format(
        (float) $value,
        2
    ) . $suffix;
}


/**
 * Read a value from booking_data.
 */
function oasis_admin_data_value(
    $data,
    $keys
) {

    foreach ( $keys as $key ) {

        if (
            isset( $data[ $key ] ) &&
            $data[ $key ] !== ''
        ) {

            if ( is_scalar( $data[ $key ] ) ) {
                return (string) $data[ $key ];
            }
        }
    }

    return '';
}


/**
 * Format booking datetime.
 */
function oasis_admin_format_datetime(
    $datetime
) {

    if ( empty( $datetime ) ) {
        return '—';
    }

    $timestamp = strtotime( $datetime );

    if ( ! $timestamp ) {
        return $datetime;
    }

    return wp_date(
        get_option( 'date_format' ) . ' ' . get_option( 'time_format' ),
        $timestamp
    );
}


/**
 * Export all Oasis bookings as CSV.
 */
function oasis_export_bookings_csv() {

    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'You do not have permission to export bookings.' );
    }

    check_admin_referer( 'oasis_export_bookings_csv' );

    global $wpdb;

    $table_name = $wpdb->prefix . 'oasis_bookings';

    $bookings = $wpdb->get_results(
        "SELECT *
         FROM {$table_name}
         ORDER BY id DESC",
        OBJECT
    );

    nocache_headers();

    header( 'Content-Type: text/csv; charset=utf-8' );
    header(
        'Content-Disposition: attachment; filename=oasis-bookings-' .
        wp_date( 'Y-m-d_H-i-s' ) .
        '.csv'
    );

    echo "\xEF\xBB\xBF";

    $output = fopen( 'php://output', 'w' );

    fputcsv(
        $output,
        array(
            'Booking ID',
            'Booking Reference',
            'Oasis Booking Status',
            'Payment Status',
            'WooCommerce Order ID',
            'WooCommerce Status',
            'Customer Name',
            'Customer Email',
            'Customer Phone',
            'Booking Type',
            'Service Type',
            'Vehicle',
            'Pickup Date / Time',
            'Booking End',
            'Return Date / Time',
            'Pickup Type',
            'Pickup Address',
            'Pickup Suburb',
            'Drop-off Type',
            'Drop-off Address',
            'Drop-off Suburb',
            'Flight Number',
            'Passengers',
            'Check-in Bags',
            'Small / Carry-on Bags',
            'Baby Seats',
            'Forward-facing / Booster Seats',
            'Hours',
            'Outbound Distance (km)',
            'Return Distance (km)',
            'Outbound Duration (minutes)',
            'Return Duration (minutes)',
            'Base Fare',
            'Distance Fare',
            'Hourly Fare',
            'Subtotal',
            'Tolls',
            'Parking',
            'Levy',
            'Original Total',
            'Coupon Discount',
            'Final Total',
            'Coupon Code(s)',
            'Special Instructions',
            'Created',
            'Updated',
            'Return Pickup Type',
            'Return Pickup Address',
            'Return Drop-off Type',
            'Return Drop-off Address',
            'Booking Data JSON',
        )
    );

    foreach ( $bookings as $booking ) {

        $booking_data = array();

        if ( ! empty( $booking->booking_data ) ) {
            $decoded = json_decode(
                $booking->booking_data,
                true
            );

            if ( is_array( $decoded ) ) {
                $booking_data = $decoded;
            }
        }

        $order = false;

        if (
            ! empty( $booking->woocommerce_order_id ) &&
            function_exists( 'wc_get_order' )
        ) {
            $order = wc_get_order(
                (int) $booking->woocommerce_order_id
            );
        }

        $customer = oasis_admin_get_customer_data(
            $booking,
            $booking_data,
            $order
        );

        $woo_status = '';

        if ( $order ) {
            $woo_status = wc_get_order_status_name(
                $order->get_status()
            );
        }

        fputcsv(
            $output,
            array(
                $booking->id,
                $booking->booking_reference,
                $booking->booking_status,
                $booking->payment_status,
                $booking->woocommerce_order_id,
                $woo_status,
                $customer['name'],
                $customer['email'],
                $customer['phone'],
                $booking->booking_type,
                $booking->service_type,
                oasis_admin_vehicle_label( $booking->vehicle_key ),
                $booking->pickup_datetime,
                $booking->booking_end_datetime,
                $booking->return_datetime,
                $booking->pickup_type,
                oasis_admin_data_value( $booking_data, array( 'pickup_address', 'pickup' ) ),
                oasis_admin_data_value( $booking_data, array( 'pickupSuburb', 'pickup_suburb', 'pickup_locality' ) ),
                $booking->dropoff_type,
                oasis_admin_data_value( $booking_data, array( 'dropoff_address', 'dropoff' ) ),
                oasis_admin_data_value( $booking_data, array( 'dropoffSuburb', 'dropoff_suburb', 'dropoff_locality' ) ),
                oasis_admin_data_value( $booking_data, array( 'flight_number', 'flightNumber' ) ),
                $booking->passengers,
                $booking->check_in_bags,
                $booking->small_carry_on_bags,
                $booking->baby_seats,
                $booking->booster_seats,
                $booking->hours,
                $booking->outbound_distance,
                $booking->return_distance,
                oasis_admin_data_value( $booking_data, array( 'routeDurationMinutes', 'durationMinutes', 'duration_minutes' ) ),
                oasis_admin_data_value( $booking_data, array( 'returnRouteDurationMinutes', 'returnDurationMinutes', 'return_duration_minutes' ) ),
                $booking->base_fare,
                $booking->distance_fare,
                $booking->hourly_fare,
                $booking->subtotal,
                $booking->tolls,
                $booking->parking,
                $booking->levy,
                $booking->total,
                isset( $booking->discount_amount )
                    ? $booking->discount_amount
                    : 0,
                isset( $booking->final_total ) &&
                (float) $booking->final_total > 0
                    ? $booking->final_total
                    : $booking->total,
                $booking->coupon_codes ?? '',
                $booking->special_instructions,
                $booking->created_at,
                $booking->updated_at,
                $booking->return_pickup_type,
                oasis_admin_data_value( $booking_data, array( 'return_pickup_address', 'returnPickupAddress' ) ),
                $booking->return_dropoff_type,
                oasis_admin_data_value( $booking_data, array( 'return_dropoff_address', 'returnDropoffAddress' ) ),
                $booking->booking_data,
            )
        );
    }

    fclose( $output );
    exit;
}


/**
 * Vehicle label.
 */
function oasis_admin_vehicle_label(
    $vehicle_key
) {

    $labels = array(
        'sedan'          => 'Sedan',
        'premium_sedan'  => 'Premium Sedan',
        'premium_suv'    => 'Premium SUV',
        'mercedes_glc'   => 'Mercedes GLC',
        'mercedes_v'     => 'Mercedes V-Class',
        'mercedes_v_class' => 'Mercedes V-Class',
        'kia_carnival'   => 'Kia Carnival',
        'bmw_7_series'   => 'BMW 7 Series',
        'lexus_es300h'   => 'Lexus ES300h',
    );

    $key = strtolower(
        trim(
            (string) $vehicle_key
        )
    );

    if ( isset( $labels[ $key ] ) ) {
        return $labels[ $key ];
    }

    if ( $vehicle_key === '' ) {
        return '—';
    }

    return ucwords(
        str_replace(
            array( '_', '-' ),
            ' ',
            $vehicle_key
        )
    );
}