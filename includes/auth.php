<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}


/**
 * Register Oasis authentication REST API routes.
 */
function oasis_register_auth_routes() {

    register_rest_route(
        'oasis/v1',
        '/me',
        array(
            'methods'  => 'GET',
            'callback' => 'oasis_api_current_user',
            'permission_callback' => '__return_true',
        )
    );
}

add_action(
    'rest_api_init',
    'oasis_register_auth_routes'
);


/**
 * Return to the Oasis booking page after a WooCommerce account login or
 * registration. The app-provided URL is validated by WordPress, so it cannot
 * be used as an external redirect target.
 */
function oasis_get_account_return_url() {

    if ( empty( $_REQUEST['oasis_return_to'] ) ) {
        return '';
    }

    $return_url = esc_url_raw(
        wp_unslash( $_REQUEST['oasis_return_to'] )
    );

    $fallback_url = function_exists( 'wc_get_page_permalink' )
        ? wc_get_page_permalink( 'myaccount' )
        : home_url( '/my-account/' );

    return wp_validate_redirect(
        $return_url,
        $fallback_url
    );
}


function oasis_redirect_after_account_login( $redirect, $user ) {

    $oasis_return_url = oasis_get_account_return_url();

    return $oasis_return_url ?: $redirect;
}

add_filter(
    'woocommerce_login_redirect',
    'oasis_redirect_after_account_login',
    20,
    2
);


function oasis_redirect_after_account_registration( $redirect ) {

    $oasis_return_url = oasis_get_account_return_url();

    return $oasis_return_url ?: $redirect;
}

add_filter(
    'woocommerce_registration_redirect',
    'oasis_redirect_after_account_registration',
    20
);


/**
 * Return the current WordPress user.
 */
function oasis_api_current_user() {

    $user_id = get_current_user_id();

    if ( ! $user_id ) {
        return array(
            'logged_in' => false,
            'user'      => null,
        );
    }

    $user = wp_get_current_user();

    return array(
        'logged_in' => true,

        'user' => array(
            'id'    => $user->ID,
            'name'  => $user->display_name,
            'email' => $user->user_email,
        ),
    );
}
