<?php defined('ABSPATH') || exit; get_header(); while (have_posts()) : the_post(); ?>
<main><section class="subhero page-intro"><div class="container subhero__inner"><h1><?php the_title(); ?></h1></div></section><section class="editorial-section"><div class="container"><article class="editorial-copy"><?php the_content(); wp_link_pages(); ?></article></div></section></main>
<?php endwhile; get_footer(); ?>
