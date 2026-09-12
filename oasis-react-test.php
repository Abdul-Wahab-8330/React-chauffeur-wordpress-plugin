<?php
/**
 * Plugin Name: Oasis React Booking Plugin
 * Description: A WordPress plugin that integrates a React-based booking system for Oasis.
 * Version: 2.0.8
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

require_once plugin_dir_path( __FILE__ ) . 'includes/api.php';

require_once plugin_dir_path( __FILE__ ) . 'includes/auth.php';

require_once plugin_dir_path( __FILE__ ) . 'includes/booking.php';

require_once plugin_dir_path( __FILE__ ) . 'includes/admin-bookings.php';


register_activation_hook(
    __FILE__,
    'oasis_create_bookings_table'
);

function oasis_react_booking_assets() {

    wp_enqueue_style(
        'oasis-react-booking',
        plugin_dir_url( __FILE__ ) . 'dist/app.css',
        array(),
        '2.0.8'
    );

   wp_enqueue_script(
    'oasis-react-booking',
    plugin_dir_url( __FILE__ ) . 'dist/app.js',
    array(),
    '2.0.8',
    true
);

wp_localize_script(
    'oasis-react-booking',
    'OasisWP',
    array(
        'restUrl' => esc_url_raw(
            rest_url( 'oasis/v1/' )
        ),
        'nonce' => wp_create_nonce( 'wp_rest' ),
        'vehicleImages' => oasis_get_vehicle_images(),
        'myAccountUrl' => function_exists( 'wc_get_page_permalink' )
            ? wc_get_page_permalink( 'myaccount' )
            : home_url( '/my-account/' ),
    )
);
}

/**
 * Use existing WooCommerce product images when their product slugs match the
 * booking vehicle keys. Missing images are simply omitted by the React UI.
 */
function oasis_get_vehicle_images() {

    if ( ! function_exists( 'wc_get_product' ) ) {
        return array();
    }

    $vehicle_keys = array(
        'bmw-7-series',
        'lexus-es300h',
        'mercedes-glc',
        'mercedes-v-class',
        'kia-carnival',
    );

    $vehicle_names = array(
        'bmw-7-series' => 'BMW 7 Series',
        'lexus-es300h' => 'Lexus ES300h',
        'mercedes-glc' => 'Mercedes GLC',
        'mercedes-v-class' => 'Mercedes V-Class',
        'kia-carnival' => 'Kia Carnival',
    );

    $images = array();

    foreach ( $vehicle_keys as $vehicle_key ) {
        $product_post = get_page_by_path(
            $vehicle_key,
            OBJECT,
            'product'
        );

        if ( ! $product_post && isset( $vehicle_names[ $vehicle_key ] ) ) {
            $product_post = get_page_by_title(
                $vehicle_names[ $vehicle_key ],
                OBJECT,
                'product'
            );
        }

        if ( ! $product_post ) {
            continue;
        }

        $product = wc_get_product( $product_post->ID );

        if ( ! $product ) {
            continue;
        }

        /*
         * The featured/main product image must always come first.
         */
        $vehicle_image_urls = array();

        $featured_image_id = $product->get_image_id();

        if ( $featured_image_id ) {

            $featured_image_url = wp_get_attachment_image_url(
                $featured_image_id,
                'woocommerce_thumbnail'
            );

            if ( $featured_image_url ) {
                $vehicle_image_urls[] = $featured_image_url;
            }
        }

        /*
         * Add only the first gallery image that is not already
         * displayed, so the featured image is never shown twice.
         */
        $gallery_image_ids = $product->get_gallery_image_ids();

        foreach ( $gallery_image_ids as $gallery_image_id ) {

            if ( (int) $gallery_image_id === (int) $featured_image_id ) {
                continue;
            }

            $gallery_image_url = wp_get_attachment_image_url(
                $gallery_image_id,
                'woocommerce_thumbnail'
            );

            if ( $gallery_image_url ) {
                $vehicle_image_urls[] = $gallery_image_url;
            }

            break;
        }

        if ( ! empty( $vehicle_image_urls ) ) {
            $images[ $vehicle_key ] = $vehicle_image_urls;
        }
    }

    return $images;
}

function oasis_react_booking_shortcode() {

    oasis_react_booking_assets();

    return '<div id="root" class="oasis-booking-app"><div class="oasis-plugin-loader" role="status">Loading booking experience...</div></div>';
}

add_shortcode(
    'oasis_react_booking',
    'oasis_react_booking_shortcode'
);


