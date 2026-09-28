<?php defined('ABSPATH') || exit; get_header(); while (have_posts()) : the_post(); ?>
<main><section class="subhero page-intro"><div class="container subhero__inner"><nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="/index.html">Главная</a> / <a href="<?php echo esc_url(home_url('/')); ?>">Советы по мебели</a></nav><h1><?php the_title(); ?></h1><p><?php echo esc_html(get_the_date()); ?> · ART HOMEY</p></div></section>
<section class="editorial-section"><div class="container"><article class="editorial-copy">
<?php if (has_post_thumbnail()) the_post_thumbnail('large', array('class'=>'journal-cover')); ?>
<?php the_content(); wp_link_pages(); ?>
<p><a href="<?php echo esc_url(home_url('/')); ?>">← Все новые статьи</a> · <a href="/projects.html">Посмотреть проекты</a></p>
</article></div></section></main>
<?php endwhile; get_footer(); ?>
