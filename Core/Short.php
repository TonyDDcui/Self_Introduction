<?php

function Content($post)
{
    $content = $post->content;


    $pattern = '/\<img.*?src\=\"(.*?)\"[^>]*>/i';
    $replacement = '<img class="lazy" data-original="$1" alt="'.$post->title.'">';
    $content= preg_replace($pattern, $replacement, $content);
    echo $content;
    
}