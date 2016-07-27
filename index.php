<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>

<head>
    <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
    <meta content="utf-8" http-equiv="encoding">
    <title>Lightbox</title>
    <script type="text/javascript" src="js/main.js"></script>
    <link rel="stylesheet" type="text/css" href="css/style.css">
</head>

<body>
    <div id="photocache"></div>
    <div id="content">
        <ul id="container">
            <div id="loading"></div>
        </ul>
    </div>
    <div id="lightbox">
        <div id="lightboxbg"></div>
        <div id="lightboxphoto">
            <div id="lightboxphotoholder">
                <div class="lightboxphotoelem"></div>
            </div>
            <div id="lightboxcaption"></div>
        </div>
        <div id="lightboxarrows">
            <div id="left" class="prev"><span class="left"></span></div>
            <div id="right" class="next"><span class="right"></span></div>
        </div>
        <div class="close"></div>
        <div id="hint">Psst - you can use arrow and escape keys, too!</div>
    </div>
</body>

</html>
