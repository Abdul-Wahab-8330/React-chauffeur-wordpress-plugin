<?php

if (!defined('ABSPATH')) {
    exit;
}


/**
 * Create Oasis bookings table.
 */
function oasis_create_bookings_table()
{

    global $wpdb;

    $table_name = $wpdb->prefix . 'oasis_bookings';

    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE {$table_name} (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        booking_reference varchar(50) NOT NULL,

        user_id bigint(20) unsigned NOT NULL,
        woocommerce_order_id bigint(20) unsigned DEFAULT NULL,

        booking_status varchar(30) NOT NULL DEFAULT 'pending',
        payment_status varchar(30) NOT NULL DEFAULT 'pending',

        booking_type varchar(30) NOT NULL,
        service_type varchar(30) NOT NULL,

        pickup_datetime datetime NOT NULL,
booking_end_datetime datetime DEFAULT NULL,
return_datetime datetime DEFAULT NULL,


        pickup_type varchar(50) DEFAULT NULL,
        dropoff_type varchar(50) DEFAULT NULL,

        return_pickup_type varchar(50) DEFAULT NULL,
        return_dropoff_type varchar(50) DEFAULT NULL,

        vehicle_key varchar(100) DEFAULT NULL,

        passengers int unsigned NOT NULL DEFAULT 0,
        check_in_bags int unsigned NOT NULL DEFAULT 0,
        small_carry_on_bags int unsigned NOT NULL DEFAULT 0,

        baby_seats int unsigned NOT NULL DEFAULT 0,
        booster_seats int unsigned NOT NULL DEFAULT 0,

        hours decimal(6,2) DEFAULT NULL,

        outbound_distance decimal(10,2) DEFAULT NULL,
        return_distance decimal(10,2) DEFAULT NULL,

        base_fare decimal(10,2) NOT NULL DEFAULT 0.00,
distance_fare decimal(10,2) NOT NULL DEFAULT 0.00,
hourly_fare decimal(10,2) NOT NULL DEFAULT 0.00,

subtotal decimal(10,2) NOT NULL DEFAULT 0.00,
tolls decimal(10,2) NOT NULL DEFAULT 0.00,
parking decimal(10,2) NOT NULL DEFAULT 0.00,
levy decimal(10,2) NOT NULL DEFAULT 0.00,
total decimal(10,2) NOT NULL DEFAULT 0.00,
discount_amount decimal(10,2) NOT NULL DEFAULT 0.00,
final_total decimal(10,2) NOT NULL DEFAULT 0.00,
coupon_codes text DEFAULT NULL,

special_instructions text DEFAULT NULL,

        booking_data longtext DEFAULT NULL,

        created_at datetime NOT NULL,
        updated_at datetime NOT NULL,

        PRIMARY KEY  (id),
        UNIQUE KEY booking_reference (booking_reference),
        KEY user_id (user_id),
        KEY woocommerce_order_id (woocommerce_order_id),
        KEY booking_status (booking_status),
        KEY pickup_datetime (pickup_datetime),
        KEY return_datetime (return_datetime),
        KEY vehicle_key (vehicle_key)
    ) {$charset_collate};";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';

    dbDelta($sql);
}












/**
 * Set the WooCommerce cart price for an Oasis booking.
 */
add_action(
    'woocommerce_before_calculate_totals',
    'oasis_set_booking_cart_price'
);

function oasis_set_booking_cart_price($cart)
{

    if (is_admin() && !defined('DOING_AJAX')) {
        return;
    }

    foreach ($cart->get_cart() as $cart_item) {

        if (
            isset($cart_item['oasis_booking_price'])
        ) {
            $cart_item['data']->set_price(
                (float) $cart_item['oasis_booking_price']
            );
        }
    }
}



/**
 * Hide the internal Oasis checkout product
 * from normal WooCommerce catalog visibility.
 *
 * Product 2081 must remain published because
 * the booking engine adds it to the cart
 * programmatically.
 */
add_filter(
    'woocommerce_product_is_visible',
    'oasis_hide_checkout_product_from_catalog',
    20,
    2
);

function oasis_hide_checkout_product_from_catalog(
    $visible,
    $product_id
) {
    if (2081 === (int) $product_id) {
        return false;
    }

    return $visible;
}





/**
 * Exclude the internal Oasis checkout product
 * from WooCommerce product queries.
 */
add_action(
    'woocommerce_product_query',
    'oasis_exclude_checkout_product_from_queries'
);

function oasis_exclude_checkout_product_from_queries($query)
{
    $excluded_ids = $query->get('post__not_in');

    if (!is_array($excluded_ids)) {
        $excluded_ids = array();
    }

    $excluded_ids[] = 2081;

    $query->set(
        'post__not_in',
        array_unique($excluded_ids)
    );
}





/**
 * Get the Oasis booking associated with a WooCommerce cart item.
 */
function oasis_get_booking_for_cart_item($cart_item)
{

    if (empty($cart_item['oasis_booking_id'])) {
        return false;
    }

    global $wpdb;

    $booking_id = absint(
        $cart_item['oasis_booking_id']
    );

    if (!$booking_id) {
        return false;
    }

    $table_name =
        $wpdb->prefix . 'oasis_bookings';

    $booking = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT *
             FROM {$table_name}
             WHERE id = %d
             LIMIT 1",
            $booking_id
        ),
        ARRAY_A
    );

    return $booking ?: false;
}


/**
 * Format an Oasis booking datetime for display.
 */
function oasis_format_booking_datetime($datetime)
{

    if (empty($datetime)) {
        return '';
    }

    $date = date_create(
        $datetime,
        wp_timezone()
    );

    if (!$date) {
        return $datetime;
    }

    return wp_date(
        'j M Y, g:i A',
        $date->getTimestamp(),
        wp_timezone()
    );
}


/**
 * Convert the stored vehicle key into a
 * customer-friendly label.
 */
function oasis_get_vehicle_label($vehicle_key)
{

    $vehicle_key = strtolower(
        trim((string) $vehicle_key)
    );

    $vehicle_labels = array(
        'bmw-7-series' => 'BMW 7 Series',
        'bmw_7_series' => 'BMW 7 Series',
        'lexus-es300h' => 'Lexus ES300h',
        'lexus_es300h' => 'Lexus ES300h',
        'mercedes-glc' => 'Mercedes GLC',
        'mercedes_glc' => 'Mercedes GLC',
        'mercedes-v-class' => 'Mercedes V Class',
        'mercedes_v_class' => 'Mercedes V Class',
        'kia-carnival' => 'Kia Carnival',
        'kia_carnival' => 'Kia Carnival',
    );

    if (isset($vehicle_labels[$vehicle_key])) {
        return $vehicle_labels[$vehicle_key];
    }

    return ucwords(
        str_replace(
            array('-', '_'),
            ' ',
            $vehicle_key
        )
    );
}


/**
 * Build the customer-facing booking details once.
 *
 * The Oasis booking table remains the source of truth.
 * The original React payload is used only for fields
 * such as the return route that are stored inside
 * booking_data rather than dedicated columns.
 */
function oasis_get_booking_display_data($booking)
{

    $payload = array();

    if (!empty($booking['booking_data'])) {

        $decoded_payload =
            json_decode(
                $booking['booking_data'],
                true
            );

        if (is_array($decoded_payload)) {
            $payload = $decoded_payload;
        }
    }

    $display_data = array();

    $display_data['Booking Reference'] =
        $booking['booking_reference'];

    $display_data['Vehicle'] =
        oasis_get_vehicle_label(
            $booking['vehicle_key']
        );

    $display_data['Service'] =
        ucwords(
            str_replace(
                array('-', '_'),
                ' ',
                $booking['booking_type']
            )
        );

    if (
        !empty($payload['pickup']) &&
        !empty($payload['dropoff'])
    ) {
        $display_data['Route'] =
            $payload['pickup'] .
            ' → ' .
            $payload['dropoff'];
    }

    $display_data['Pickup'] =
        oasis_format_booking_datetime(
            $booking['pickup_datetime']
        );

    $display_data['Passengers'] =
        (string) $booking['passengers'];

    if ((int) $booking['check_in_bags'] > 0) {
        $display_data['Checked bags'] =
            (string) $booking['check_in_bags'];
    }

    if ((int) $booking['small_carry_on_bags'] > 0) {
        $display_data['Carry-on bags'] =
            (string) $booking['small_carry_on_bags'];
    }

    if ((int) $booking['baby_seats'] > 0) {
        $display_data['Rear-facing infant seats'] =
            (string) $booking['baby_seats'];
    }

    if ((int) $booking['booster_seats'] > 0) {
        $display_data['Forward-facing child seats'] =
            (string) $booking['booster_seats'];
    }

    if (!empty($booking['return_datetime'])) {

        if (
            !empty($payload['returnPickup']) &&
            !empty($payload['returnDropoff'])
        ) {
            $display_data['Return route'] =
                $payload['returnPickup'] .
                ' → ' .
                $payload['returnDropoff'];
        }

        $display_data['Return pickup'] =
            oasis_format_booking_datetime(
                $booking['return_datetime']
            );
    }

    return $display_data;
}


/**
 * Add Oasis booking details to the WooCommerce
 * cart and checkout item display.
 */
add_filter(
    'woocommerce_get_item_data',
    'oasis_add_booking_cart_item_data',
    20,
    2
);

function oasis_add_booking_cart_item_data(
    $item_data,
    $cart_item
) {

    $booking =
        oasis_get_booking_for_cart_item(
            $cart_item
        );

    if (!$booking) {
        return $item_data;
    }

    $display_data =
        oasis_get_booking_display_data(
            $booking
        );

    foreach ($display_data as $name => $value) {

        if ('' === (string) $value) {
            continue;
        }

        $item_data[] = array(
            'name' => $name,
            'value' => $value,
        );
    }

    return $item_data;
}


/**
 * Replace the temporary WooCommerce product name
 * with the proper Oasis booking name in the cart
 * and checkout.
 */
add_filter(
    'woocommerce_cart_item_name',
    'oasis_booking_cart_item_name',
    20,
    3
);



function oasis_booking_cart_item_name(
    $product_name,
    $cart_item,
    $cart_item_key
) {

    if (empty($cart_item['oasis_booking_id'])) {
        return $product_name;
    }

    $booking =
        oasis_get_booking_for_cart_item(
            $cart_item
        );

    if (!$booking) {
        return $product_name;
    }

    return 'Oasis Chauffeur Booking';
}



/**
 * Send Oasis booking cart item links
 * directly to the Cart page instead of
 * the internal checkout product page.
 */
add_filter(
    'woocommerce_cart_item_permalink',
    'oasis_booking_cart_item_permalink',
    20,
    3
);

function oasis_booking_cart_item_permalink(
    $permalink,
    $cart_item,
    $cart_item_key
) {
    if (empty($cart_item['oasis_booking_id'])) {
        return $permalink;
    }

    return function_exists('wc_get_cart_url')
        ? wc_get_cart_url()
        : $permalink;
}



/**
 * Send Oasis booking links in the header mini-cart
 * directly to the WooCommerce Cart page.
 */
add_filter(
    'woocommerce_widget_cart_item_name',
    'oasis_booking_widget_cart_item_name',
    20,
    3
);

function oasis_booking_widget_cart_item_name(
    $product_name,
    $cart_item,
    $cart_item_key
) {
    if (empty($cart_item['oasis_booking_id'])) {
        return $product_name;
    }

    $booking = oasis_get_booking_for_cart_item($cart_item);

    if (!$booking) {
        return $product_name;
    }

    $cart_url = function_exists('wc_get_cart_url')
        ? wc_get_cart_url()
        : '';

    if (!$cart_url) {
        return $product_name;
    }

    return sprintf(
        '<a href="%s">%s</a>',
        esc_url($cart_url),
        esc_html('Oasis Chauffeur Booking')
    );
}


/**
 * Send Oasis booking order-item links
 * directly to the Cart page instead of
 * the internal checkout product page.
 */
add_filter(
    'woocommerce_order_item_permalink',
    'oasis_booking_order_item_permalink',
    20,
    3
);

function oasis_booking_order_item_permalink(
    $permalink,
    $item,
    $order
) {
    if (!$item || !is_object($item)) {
        return $permalink;
    }

    if (2081 !== (int) $item->get_product_id()) {
        return $permalink;
    }

    return function_exists('wc_get_cart_url')
        ? wc_get_cart_url()
        : $permalink;
}





/**
 * Remove the temporary checkout product image from
 * Oasis cart/mini-cart items.
 */
add_filter(
    'woocommerce_cart_item_thumbnail',
    'oasis_booking_cart_item_thumbnail',
    20,
    3
);

function oasis_booking_cart_item_thumbnail(
    $thumbnail,
    $cart_item,
    $cart_item_key
) {
    if (empty($cart_item['oasis_booking_id'])) {
        return $thumbnail;
    }

    return '';
}



/**
 * Add Oasis booking details to the WooCommerce
 * order line item.
 *
 * These visible item meta fields are available
 * in WooCommerce order admin and standard emails.
 */
add_action(
    'woocommerce_checkout_create_order_line_item',
    'oasis_add_booking_data_to_order_item',
    20,
    4
);

function oasis_add_booking_data_to_order_item(
    $item,
    $cart_item_key,
    $values,
    $order
) {

    $booking =
        oasis_get_booking_for_cart_item(
            $values
        );

    if (!$booking) {
        return;
    }

    $display_data =
        oasis_get_booking_display_data(
            $booking
        );

    $item->set_name(
        'Oasis Chauffeur Booking'
    );

    foreach ($display_data as $name => $value) {

        if ('' === (string) $value) {
            continue;
        }

        $item->add_meta_data(
            $name,
            $value,
            true
        );
    }

    if (!empty($booking['special_instructions'])) {

        $item->add_meta_data(
            'Special instructions',
            $booking['special_instructions'],
            true
        );
    }

    if ($order && $order->get_discount_total() > 0) {

        $coupon_codes = $order->get_coupon_codes();

        if (!empty($coupon_codes)) {
            $item->add_meta_data(
                'Coupon code',
                implode(', ', $coupon_codes),
                true
            );
        }

        $item->add_meta_data(
            'Coupon discount',
            wc_price($order->get_discount_total()),
            true
        );
    }
}








/**
 * Expire abandoned Oasis bookings.
 *
 * A booking is considered abandoned when:
 *
 * - it is still pending
 * - it never received a WooCommerce order
 * - the booking was created more than 30 minutes ago
 *
 * NULL and 0 are both treated as "no WooCommerce order"
 * because some older test records used 0.
 */
function oasis_expire_abandoned_bookings()
{

    global $wpdb;

    $table_name =
        $wpdb->prefix . 'oasis_bookings';

    $expiry_minutes = 30;

    $cutoff =
        date(
            'Y-m-d H:i:s',
            current_time('timestamp') -
            ($expiry_minutes * MINUTE_IN_SECONDS)
        );

    $wpdb->query(
        $wpdb->prepare(
            "UPDATE {$table_name}
             SET booking_status = 'expired',
                 updated_at = %s
             WHERE booking_status = 'pending'
             AND (
                 woocommerce_order_id IS NULL
                 OR woocommerce_order_id = 0
             )
             AND created_at < %s",
            current_time('mysql'),
            $cutoff
        )
    );
}

















/**
 * Prevent checkout from using an expired Oasis booking.
 *
 * A stale cart can survive after the booking's 30-minute
 * expiry window. Re-check the Oasis booking before Woo
 * allows the customer to place the order.
 */
/**
 * Prevent expired Oasis bookings from
 * remaining usable in the WooCommerce cart.
 */
function oasis_validate_cart_booking_status()
{
    static $checked = false;

    if ($checked) {
        return true;
    }

    $checked = true;

    if (!function_exists('WC') || !WC()->cart) {
        return true;
    }

    /*
     * Run expiration immediately so we do not
     * depend only on WP-Cron or admin traffic.
     */
    oasis_expire_abandoned_bookings();

    $invalid_items = array();

    foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) {

        if (empty($cart_item['oasis_booking_id'])) {
            continue;
        }

        $booking = oasis_get_booking_for_cart_item(
            $cart_item
        );

        if (
            !$booking ||
            'expired' === $booking['booking_status']
        ) {
            $invalid_items[] = $cart_item_key;
        }
    }

    if (empty($invalid_items)) {
        return true;
    }

    foreach ($invalid_items as $cart_item_key) {
        WC()->cart->remove_cart_item(
            $cart_item_key
        );
    }

    wc_add_notice(
        'Your Oasis booking has expired. Please return to the booking page and create a new booking.',
        'error'
    );

    return false;
}

add_action(
    'woocommerce_check_cart_items',
    'oasis_validate_cart_booking_status'
);

add_action(
    'woocommerce_checkout_process',
    'oasis_validate_cart_booking_status'
);

/**
 * Link an Oasis booking to the WooCommerce order.
 */

/**
 * Add Oasis booking information to the
 * WooCommerce order while the order is created.
 *
 * At this stage the WooCommerce order ID
 * may still be 0, so we only store the
 * Oasis booking information as order meta.
 */
add_action(
    'woocommerce_checkout_create_order',
    'oasis_add_booking_meta_to_order',
    20,
    2
);

function oasis_add_booking_meta_to_order($order, $data)
{

    if (!$order || !WC()->cart) {
        return;
    }

    foreach (WC()->cart->get_cart() as $cart_item) {

        if (
            isset($cart_item['oasis_booking_id'])
        ) {

            $booking_id =
                absint(
                    $cart_item['oasis_booking_id']
                );

            $booking_reference =
                sanitize_text_field(
                    $cart_item['oasis_booking_reference'] ?? ''
                );

            if (!$booking_id) {
                return;
            }

            /*
             * Store Oasis information on the
             * WooCommerce order.
             *
             * These values will be saved when
             * WooCommerce saves the order.
             */
            $order->update_meta_data(
                '_oasis_booking_id',
                $booking_id
            );

            $order->update_meta_data(
                '_oasis_booking_reference',
                $booking_reference
            );

            return;
        }
    }
}


/**
 * Link the Oasis booking to the WooCommerce
 * order after WooCommerce has created the order.
 */
add_action(
    'woocommerce_checkout_order_processed',
    'oasis_link_booking_to_order',
    20,
    3
);

function oasis_link_booking_to_order(
    $order_id,
    $posted_data,
    $order
) {

    global $wpdb;

    $order_id = absint($order_id);

    if (!$order_id) {
        return;
    }

    /*
     * Make sure we have the WooCommerce
     * order object.
     */
    if (
        !$order ||
        !$order instanceof WC_Order
    ) {
        $order = wc_get_order($order_id);
    }

    if (!$order) {
        return;
    }

    /*
     * Retrieve the Oasis booking ID that
     * was saved onto the WooCommerce order.
     */
    $booking_id =
        absint(
            $order->get_meta(
                '_oasis_booking_id',
                true
            )
        );

    if (!$booking_id) {
        return;
    }

    /*
     * Load the booking before linking it.
     *
     * An expired booking must never become a valid Oasis
     * booking just because an old cart session survived.
     */
    $table_name =
        $wpdb->prefix . 'oasis_bookings';

    $booking = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT *
             FROM {$table_name}
             WHERE id = %d
             LIMIT 1",
            $booking_id
        )
    );

    if (!$booking || 'expired' === $booking->booking_status) {
        return;
    }

    $discount_amount = (float) $order->get_discount_total();
    $final_total = (float) $order->get_total();
    $coupon_codes = $order->get_coupon_codes();

    $wpdb->update(
        $table_name,

        array(
            'woocommerce_order_id' =>
                $order_id,

            'discount_amount' =>
                $discount_amount,

            'final_total' =>
                $final_total,

            'coupon_codes' =>
                !empty($coupon_codes)
                ? implode(', ', $coupon_codes)
                : '',

            'updated_at' =>
                current_time('mysql'),
        ),

        array(
            'id' =>
                $booking_id,
        ),

        array(
            '%d',
            '%f',
            '%f',
            '%s',
            '%s',
        ),

        array(
            '%d',
        )
    );
}


/**
 * Synchronize important WooCommerce order statuses
 * back to the linked Oasis booking.
 *
 * We intentionally do NOT convert "processing"
 * into "confirmed".
 *
 * COD orders may be processing while the booking
 * is still awaiting business confirmation.
 */
add_action(
    'woocommerce_order_status_changed',
    'oasis_sync_order_status_to_booking',
    20,
    4
);

function oasis_sync_order_status_to_booking(
    $order_id,
    $old_status,
    $new_status,
    $order
) {

    global $wpdb;

    if (
        !$order ||
        !$order instanceof WC_Order
    ) {
        $order = wc_get_order($order_id);
    }

    if (!$order) {
        return;
    }

    $booking_id =
        absint(
            $order->get_meta(
                '_oasis_booking_id',
                true
            )
        );

    if (!$booking_id) {
        return;
    }

    /*
     * Only these WooCommerce statuses should
     * directly change the Oasis booking status.
     *
     * Processing / on-hold are intentionally ignored.
     */
    $status_map = array(
        'completed' => 'completed',
        'cancelled' => 'cancelled',
        'failed' => 'cancelled',
        'refunded' => 'cancelled',
    );

    if (!isset($status_map[$new_status])) {
        return;
    }

    $new_booking_status =
        $status_map[$new_status];

    $table_name =
        $wpdb->prefix . 'oasis_bookings';

    $wpdb->update(
        $table_name,
        array(
            'booking_status' =>
                $new_booking_status,

            'updated_at' =>
                current_time('mysql'),
        ),
        array(
            'id' => $booking_id,
        ),
        array(
            '%s',
            '%s',
        ),
        array(
            '%d',
        )
    );
}














/**
 * Register Oasis booking REST API route.
 */
function oasis_register_booking_routes()
{

    register_rest_route(
        'oasis/v1',
        '/bookings',
        array(
            'methods' => 'POST',
            'callback' => 'oasis_create_booking',
            'permission_callback' => function () {
                return is_user_logged_in();
            },
        )
    );
}

add_action(
    'rest_api_init',
    'oasis_register_booking_routes'
);


/**
 * Create an Oasis booking.
 */
function oasis_create_booking(WP_REST_Request $request)
{

    global $wpdb;

    $user_id = get_current_user_id();

    if (!$user_id) {
        return new WP_Error(
            'oasis_not_logged_in',
            'You must be logged in to create a booking.',
            array(
                'status' => 401,
            )
        );
    }

    $data = $request->get_json_params();

    if (!is_array($data)) {
        return new WP_Error(
            'oasis_invalid_booking',
            'Invalid booking data.',
            array(
                'status' => 400,
            )
        );
    }

    /*
     * Required fields.
     */
    $booking_type = sanitize_text_field(
        $data['bookingType'] ?? ''
    );

    $pickup = sanitize_text_field(
        $data['pickup'] ?? ''
    );

    $dropoff = sanitize_text_field(
        $data['dropoff'] ?? ''
    );

    $pickup_date = sanitize_text_field(
        $data['pickupDate'] ?? ''
    );

    $pickup_time = sanitize_text_field(
        $data['pickupTime'] ?? ''
    );

    $vehicle = sanitize_text_field(
        $data['vehicle'] ?? ''
    );

    error_log(
        'OASIS VEHICLE DEBUG: ' .
        print_r($data['vehicle'] ?? null, true)
    );

    if (
        empty($booking_type) ||
        empty($pickup) ||
        empty($dropoff) ||
        empty($pickup_date) ||
        empty($pickup_time) ||
        empty($vehicle)
    ) {
        return new WP_Error(
            'oasis_missing_booking_fields',
            'Required booking information is missing.',
            array(
                'status' => 400,
            )
        );
    }

    /*
     * Create pickup datetime.
     */
    $pickup_datetime =
        $pickup_date . ' ' . $pickup_time . ':00';

    /*
     * Return trip.
     */
    $return_trip = !empty($data['returnTrip']);

    $return_datetime = null;

    if ($return_trip) {

        $return_date = sanitize_text_field(
            $data['returnDate'] ?? ''
        );

        $return_time = sanitize_text_field(
            $data['returnTime'] ?? ''
        );

        if (
            empty($return_date) ||
            empty($return_time)
        ) {
            return new WP_Error(
                'oasis_missing_return_datetime',
                'Return date and time are required.',
                array(
                    'status' => 400,
                )
            );
        }

        $return_datetime =
            $return_date . ' ' . $return_time . ':00';
    }

    /*
     * Passenger and luggage information.
     */
    $passengers = absint(
        $data['passengers'] ?? 0
    );

    $suitcases = absint(
        $data['suitcases'] ?? 0
    );

    $small_bags = absint(
        $data['smallBags'] ?? 0
    );

    /*
     * Child seat information.
     *
     * Current React naming:
     * rearFacing    = baby seats
     * forwardFacing = booster seats
     */
    $baby_seats = absint(
        $data['babySeats'] ?? 0
    );

    $booster_seats = absint(
        $data['boosterSeats'] ?? 0
    );

    /*
     * Calculate total child seats from the
     * actual React values if supplied.
     */
    if (isset($data['rearFacing'])) {
        $baby_seats = absint(
            $data['rearFacing']
        );
    }

    if (isset($data['forwardFacing'])) {
        $booster_seats = absint(
            $data['forwardFacing']
        );
    }

    /*
     * Distances and hourly information.
     */
    $hours = isset($data['hours'])
        ? (float) $data['hours']
        : null;

    $outbound_distance =
        isset($data['distance'])
        ? (float) $data['distance']
        : null;

    $return_distance =
        isset($data['returnDistance'])
        ? (float) $data['returnDistance']
        : null;


    /*
     * Route duration information.
     *
     * Google provides duration in minutes.
     * These are used only to determine vehicle
     * occupancy for availability checking.
     */
    $route_duration_minutes =
        isset($data['routeDurationMinutes'])
        ? (float) $data['routeDurationMinutes']
        : 0;

    $return_route_duration_minutes =
        isset($data['returnRouteDurationMinutes'])
        ? (float) $data['returnRouteDurationMinutes']
        : 0;

    /*
     * Quote information.
     *
     * These are stored as a snapshot for now.
     * Server-side price validation comes later.
     */
    /*
     * Quote information.
     *
     * React currently sends the calculated quote
     * inside the "quote" object.
     *
     * These values are stored as a booking snapshot
     * for now. Server-side price validation will be
     * added before final checkout.
     */

    $quote = isset($data['quote']) && is_array($data['quote'])
        ? $data['quote']
        : array();

    $base_fare = isset($quote['baseFare'])
        ? (float) $quote['baseFare']
        : 0;

    $distance_fare = isset($quote['distanceFare'])
        ? (float) $quote['distanceFare']
        : 0;

    $hourly_fare = isset($quote['hourlyFare'])
        ? (float) $quote['hourlyFare']
        : 0;

    $baby_seat_charge = isset($quote['babySeatCharge'])
        ? (float) $quote['babySeatCharge']
        : 0;

    $booster_seat_charge = isset($quote['boosterSeatCharge'])
        ? (float) $quote['boosterSeatCharge']
        : 0;

    $levy = isset($quote['levy'])
        ? (float) $quote['levy']
        : 0;

    $parking = isset($quote['parking'])
        ? (float) $quote['parking']
        : 0;

    $tolls = isset($quote['tolls'])
        ? (float) $quote['tolls']
        : 0;

    /*
     * Subtotal = actual fare components before
     * levy, parking and tolls.
     */
    $subtotal =
        $base_fare +
        $distance_fare +
        $hourly_fare +
        $baby_seat_charge +
        $booster_seat_charge;

    $total =
        $subtotal +
        $levy +
        $parking +
        $tolls;




    /*
     * Generate booking reference.
     */
    do {

        $booking_reference =
            'OAS-' .
            strtoupper(
                wp_generate_password(
                    8,
                    false,
                    false
                )
            );

        $existing =
            $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT id
                     FROM {$wpdb->prefix}oasis_bookings
                     WHERE booking_reference = %s",
                    $booking_reference
                )
            );

    } while ($existing);

    /*
     * Current timestamps.
     */
    $now = current_time('mysql');

    /*
     * Calculate the vehicle occupancy window.
     *
     * Rules:
     *
     * Point-to-point one-way:
     * pickup + Google route duration.
     *
     * Point-to-point return:
     * outbound pickup -> return pickup.
     *
     * Hourly one-way:
     * pickup + selected hours.
     *
     * Hourly return:
     * outbound pickup -> return pickup.
     */

    $booking_end_datetime = null;

    $pickup_timestamp =
        strtotime($pickup_datetime);

    if (false === $pickup_timestamp) {
        return new WP_Error(
            'oasis_invalid_pickup_datetime',
            'Invalid pickup date or time.',
            array(
                'status' => 400,
            )
        );
    }

    /*
     * Return booking.
     *
     * We conservatively keep the vehicle occupied
     * until the return pickup time.
     */
    if ($return_trip) {

        $return_timestamp =
            strtotime($return_datetime);

        if (
            false === $return_timestamp ||
            $return_timestamp <= $pickup_timestamp
        ) {
            return new WP_Error(
                'oasis_invalid_return_datetime',
                'Return date and time must be after the pickup date and time.',
                array(
                    'status' => 400,
                )
            );
        }

        $booking_end_datetime =
            date(
                'Y-m-d H:i:s',
                $return_timestamp
            );

    } elseif ('hourly' === $booking_type) {

        /*
         * Hourly one-way.
         */
        if (empty($hours) || $hours <= 0) {
            return new WP_Error(
                'oasis_invalid_hourly_duration',
                'Hourly booking duration is required.',
                array(
                    'status' => 400,
                )
            );
        }

        $booking_end_timestamp =
            $pickup_timestamp +
            ($hours * HOUR_IN_SECONDS);

        $booking_end_datetime =
            date(
                'Y-m-d H:i:s',
                $booking_end_timestamp
            );

    } else {

        /*
         * Point-to-point one-way.
         *
         * Google duration is supplied in minutes.
         */
        if (
            $route_duration_minutes <= 0
        ) {
            return new WP_Error(
                'oasis_missing_route_duration',
                'Route duration is required for availability checking.',
                array(
                    'status' => 400,
                )
            );
        }

        $booking_end_timestamp =
            $pickup_timestamp +
            ($route_duration_minutes * MINUTE_IN_SECONDS);

        $booking_end_datetime =
            date(
                'Y-m-d H:i:s',
                $booking_end_timestamp
            );
    }






    /*
     * Expire abandoned bookings before checking
     * vehicle availability.
     *
     * This makes the availability check immediately
     * aware of stale bookings even if WP-Cron has
     * not run yet.
     */
    oasis_expire_abandoned_bookings();







    /*
     * Check vehicle availability.
     *
     * Only pending and confirmed bookings
     * occupy a vehicle.
     *
     * Cancelled/completed bookings do not
     * block availability.
     */
    $conflicting_booking =
        $wpdb->get_var(
            $wpdb->prepare(
                "SELECT id
             FROM {$wpdb->prefix}oasis_bookings
             WHERE vehicle_key = %s
             AND booking_status IN ('pending', 'confirmed')
             AND pickup_datetime < %s
             AND booking_end_datetime > %s
             LIMIT 1",
                $vehicle,
                $booking_end_datetime,
                $pickup_datetime
            )
        );

    if ($conflicting_booking) {
        return new WP_Error(
            'oasis_vehicle_unavailable',
            'This vehicle is not available for the selected time. Please choose another vehicle or time.',
            array(
                'status' => 409,
            )
        );
    }



    /*
     * Preserve the complete original
     * booking payload.
     */
    $booking_data = wp_json_encode(
        $data
    );

    $special_instructions = sanitize_textarea_field(
        $data['specialInstructions'] ?? ''
    );

    $table_name =
        $wpdb->prefix . 'oasis_bookings';



    error_log(
        'OASIS VEHICLE BEFORE INSERT: ' .
        print_r($vehicle, true)
    );


    /*
     * Insert booking.
     */
    $inserted = $wpdb->insert(
        $table_name,
        array(
            'booking_reference' =>
                $booking_reference,

            'user_id' =>
                $user_id,

            'booking_status' =>
                'pending',

            'payment_status' =>
                'pending',

            'booking_type' =>
                $booking_type,

            'service_type' =>
                $booking_type,

            'pickup_datetime' =>
                $pickup_datetime,

            'booking_end_datetime' =>
                $booking_end_datetime,

            'return_datetime' =>
                $return_datetime,

            'pickup_type' =>
                sanitize_text_field(
                    $data['pickupType'] ?? ''
                ),

            'dropoff_type' =>
                sanitize_text_field(
                    $data['dropoffType'] ?? ''
                ),

            'return_pickup_type' =>
                sanitize_text_field(
                    $data['returnPickupType'] ?? ''
                ),

            'return_dropoff_type' =>
                sanitize_text_field(
                    $data['returnDropoffType'] ?? ''
                ),

            'vehicle_key' =>
                $vehicle,

            'passengers' =>
                $passengers,

            'check_in_bags' =>
                $suitcases,

            'small_carry_on_bags' =>
                $small_bags,

            'baby_seats' =>
                $baby_seats,

            'booster_seats' =>
                $booster_seats,

            'hours' =>
                $hours,

            'outbound_distance' =>
                $outbound_distance,

            'return_distance' =>
                $return_distance,

            'base_fare' =>
                $base_fare,

            'distance_fare' =>
                $distance_fare,

            'hourly_fare' =>
                $hourly_fare,

            'subtotal' =>
                $subtotal,

            'tolls' =>
                $tolls,
            'parking' =>
                $parking,

            'levy' =>
                $levy,

            'total' =>
                $total,

            'discount_amount' =>
                0.00,

            'final_total' =>
                $total,

            'coupon_codes' =>
                '',


            'special_instructions' =>
                $special_instructions,

            'booking_data' =>
                $booking_data,

            'created_at' =>
                $now,

            'updated_at' =>
                $now,
        ),
        array(
            '%s', // booking_reference
            '%d', // user_id
            '%s', // booking_status
            '%s', // payment_status
            '%s', // booking_type
            '%s', // service_type

            '%s', // pickup_datetime
            '%s', // booking_end_datetime
            '%s', // return_datetime

            '%s', // pickup_type
            '%s', // dropoff_type
            '%s', // return_pickup_type
            '%s', // return_dropoff_type

            '%s', // vehicle_key

            '%d', // passengers
            '%d', // check_in_bags
            '%d', // small_carry_on_bags
            '%d', // baby_seats
            '%d', // booster_seats

            '%f', // hours
            '%f', // outbound_distance
            '%f', // return_distance
            '%f', // base_fare
            '%f', // distance_fare
            '%f', // hourly_fare
            '%f', // subtotal
            '%f', // tolls
            '%f', // parking
            '%f', // levy
            '%f', // total
            '%f', // discount_amount
            '%f', // final_total

            '%s', // coupon_codes

            '%s', // special_instructions
            '%s', // booking_data
            '%s', // created_at
            '%s', // updated_at
        )
    );

    if (false === $inserted) {
        return new WP_Error(
            'oasis_booking_create_failed',
            'Unable to create booking.',
            array(
                'status' => 500,
            )
        );
    }






    /*
     * Add the Oasis booking to WooCommerce cart.
     */
    if (function_exists('wc_load_cart')) {

        wc_load_cart();

        if (WC()->cart) {

            /*
             * Oasis uses WooCommerce only as a
             * checkout bridge, so only one
             * booking may exist in the cart.
             */
            WC()->cart->empty_cart();

            $cart_item_data = array(
                'oasis_booking_id' =>
                    (int) $wpdb->insert_id,

                'oasis_booking_reference' =>
                    $booking_reference,

                'oasis_booking_price' =>
                    (float) $total,
            );

            $cart_item_key =
                WC()->cart->add_to_cart(
                    2081,
                    1,
                    0,
                    array(),
                    $cart_item_data
                );

            if (!$cart_item_key) {
                return new WP_Error(
                    'oasis_cart_add_failed',
                    'Booking was created, but could not be added to the cart.',
                    array(
                        'status' => 500,
                    )
                );
            }
        }
    }






    return array(
        'success' => true,

        'booking' => array(
            'id' =>
                (int) $wpdb->insert_id,

            'reference' =>
                $booking_reference,

            'status' =>
                'pending',

            'payment_status' =>
                'pending',
        ),

        'cart_url' =>
            function_exists('wc_get_cart_url')
            ? wc_get_cart_url()
            : '',
    );
}