<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}


/**
 * Register Oasis REST API routes.
 */
function oasis_register_rest_routes() {

    register_rest_route(
        'oasis/v1',
        '/status',
        array(
            'methods'  => 'GET',
            'callback' => 'oasis_api_status',
            'permission_callback' => '__return_true',
        )
    );
}

add_action(
    'rest_api_init',
    'oasis_register_rest_routes'
);


/**
 * Oasis API status.
 */
function oasis_api_status() {

    return array(
        'success' => true,
        'plugin'  => 'Oasis React Booking Plugin',
        'version' => '1.1.0',
        'message' => 'Oasis API is working',
    );
}