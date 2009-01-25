var do_startup = function () {

  var query = '';
  $("a").each(function(idx, elm) {
	if (elm.rel && elm.rel.indexOf('disqus:') >= 0) {
      query += 'url' + idx + '=' + encodeURIComponent(elm.rel.split('disqus:')[1]) + '&';
    }
  });

  $.getScript('http://disqus.com/forums/' + DISQUS_FORUM + '/get_num_replies.js?' + query);

  if (NORMHOST) {
    var pageTracker = _gat._getTracker(GOOGLE_ANALYTICS_CODE);
    pageTracker._initData();
    pageTracker._trackPageview();
  }

  if (!document.getElementById('table-of-contents')) return;

  document.getElementById('table-of-contents').style.display = 'none';
  var abstractob = document.getElementById('abstract');
  var toc_handler = document.createElement('span');
  toc_handler.id = "toc-handler";

  var toc_handler_a = document.createElement('a');
  toc_handler_a.href = "#";
  toc_handler_a.appendChild(document.createTextNode("Table of Contents"));

  var toc_status = 0;

  toc_handler_a.onclick = function () {
    if (toc_status == 0) {
      toc_status = 1;
      document.getElementById('table-of-contents').style.display = 'block';
      return false;
    } else {
      toc_status = 0;
      document.getElementById('table-of-contents').style.display = 'none';
      return false;
    }
  };

  toc_handler.appendChild(document.createTextNode(" [ "));
  toc_handler.appendChild(toc_handler_a);
  toc_handler.appendChild(document.createTextNode(" ]"));

  var p_elems = abstractob.getElementsByTagName("p");
  p_elems[p_elems.length - 1].appendChild(toc_handler);
  toc_handler.style.fontSize = '0.9em';

  var hrefs = document.getElementById('table-of-contents').getElementsByTagName('a');
  for (var i=0; i < hrefs.length; i++) {
    if (hrefs[i].href.indexOf('#ignore-this') != -1)
      hrefs[i].parentNode.style.display = 'none';
  }

};

var NORMHOST = false;

var init_analytics = function () {
  var proto = document.location.protocol;
  if (proto == 'file:')
    return;
  var gaJsHost = (("https:" == proto) ? "https://ssl." : "http://www.");
  document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
  NORMHOST = true;
};

init_analytics();

$(document).ready(do_startup);

var dotranslate = function (selObj) {
  var google_translate_url = 'http://translate.google.com/translate?u=';
  if (selObj.options[selObj.selectedIndex].value !="") {
	parent.location=google_translate_url+encodeURIComponent(PAGE_URI)+selObj.options[selObj.selectedIndex].value;
  }
}