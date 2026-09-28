<?php defined('ABSPATH') || exit; get_header(); ?>
<main><section class="subhero page-intro"><div class="container subhero__inner"><nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="/index.html">Главная</a> / <span aria-current="page">Советы по мебели</span></nav><h1><?php echo is_search() ? 'Результаты поиска' : 'Советы по мебели'; ?></h1><p>Выбор материалов, планирование мебели и советы перед заказом.</p></div></section>
<section class="editorial-section"><div class="container">
<?php if (have_posts()) : ?><div class="advice-grid">
<?php while (have_posts()) : the_post(); ?>
<article class="advice-card"><?php if (has_post_thumbnail()) the_post_thumbnail('medium_large'); ?><p class="eyebrow">ART HOMEY · <?php echo esc_html(get_the_date()); ?></p><h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2><p><?php echo esc_html(wp_trim_words(get_the_excerpt(), 32)); ?></p><a class="advice-card__link" href="<?php the_permalink(); ?>">Читать статью →</a></article>
<?php endwhile; ?></div><nav class="journal-pagination" aria-label="Страницы статей"><?php echo paginate_links(); ?></nav>
<?php else : ?><p>Новые статьи скоро появятся. Пока посмотрите наши материалы ниже.</p><?php endif; ?>
<h2>С чего начать</h2><ul><li><a href="/kitchen-cost.html">Сколько стоит кухня на заказ</a></li><li><a href="/mdf-or-chipboard.html">МДФ или ЛДСП</a></li><li><a href="/wardrobe-storage.html">Как продумать наполнение шкафа</a></li></ul>
</div></section></main><?php get_footer(); ?>
