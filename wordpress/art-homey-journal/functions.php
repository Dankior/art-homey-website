<?php
/** ART HOMEY journal: use WordPress core permissions and block editor. */
defined('ABSPATH') || exit;
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('responsive-embeds');
    add_theme_support('html5', array('gallery', 'caption', 'style', 'script'));
    add_theme_support('editor-styles');
    add_editor_style('editor.css');
});
add_action('wp_enqueue_scripts', function () {
    $uri = get_template_directory_uri();
    wp_enqueue_style('ah-base', $uri . '/assets/style.css', array(), '1.0.0');
    wp_enqueue_style('ah-improvements', $uri . '/assets/improvements.css', array('ah-base'), '1.0.0');
    wp_enqueue_style('ah-journal', get_stylesheet_uri(), array('ah-improvements'), '1.0.0');
    wp_enqueue_script('ah-app', $uri . '/assets/app.js', array(), '1.0.0', true);
});
function ah_description() {
    return is_singular() ? wp_strip_all_tags(get_the_excerpt(get_queried_object_id())) : 'Советы ART HOMEY: выбор кухни, материалы и удобное хранение мебели.';
}
add_action('wp_head', function () {
    if (is_404()) return;
    $description = ah_description();
    $url = is_singular() ? get_permalink() : get_pagenum_link(max(1, get_query_var('paged')));
    echo '<meta name="description" content="' . esc_attr($description) . '">';
    if (!is_singular()) echo '<link rel="canonical" href="' . esc_url($url) . '">';
    echo '<meta property="og:title" content="' . esc_attr(wp_get_document_title()) . '">';
    echo '<meta property="og:description" content="' . esc_attr($description) . '">';
    echo '<meta property="og:url" content="' . esc_url($url) . '">';
    echo '<meta property="og:type" content="' . (is_single() ? 'article' : 'website') . '">';
    $image = is_singular() ? get_the_post_thumbnail_url(get_queried_object_id(), 'large') : false;
    if ($image) echo '<meta property="og:image" content="' . esc_url($image) . '">';
    if (is_single()) {
        $data = array('@context'=>'https://schema.org', '@type'=>'Article', 'headline'=>get_the_title(), 'description'=>$description, 'mainEntityOfPage'=>$url, 'datePublished'=>get_the_date(DATE_W3C), 'dateModified'=>get_the_modified_date(DATE_W3C), 'author'=>array('@type'=>'Organization','name'=>'ART HOMEY'));
        if ($image) $data['image'] = $image;
        echo '<script type="application/ld+json">' . wp_json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) . '</script>';
    }
}, 5);
// Public, read-only feed: only published posts; never exposes drafts or settings.
add_action('rest_api_init', function () {
    register_rest_route('art-homey/v1', '/articles', array(
        'methods'=>'GET', 'permission_callback'=>'__return_true',
        'callback'=>function () {
            $posts = get_posts(array('post_type'=>'post','post_status'=>'publish','numberposts'=>3,'orderby'=>'date','order'=>'DESC'));
            return rest_ensure_response(array_map(function ($post) {
                return array('title'=>html_entity_decode(wp_strip_all_tags(get_the_title($post)), ENT_QUOTES, 'UTF-8'), 'excerpt'=>wp_trim_words(wp_strip_all_tags(get_the_excerpt($post)), 32), 'url'=>get_permalink($post), 'image'=>get_the_post_thumbnail_url($post, 'medium_large') ?: null);
            }, $posts));
        }
    ));
});
