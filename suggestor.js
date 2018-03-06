const key = {
	up: 38,
	down: 40,
	esc: 27
}

function $(id) {
	return document.getElementById(id);
}

function hide() {
	$("suggestions").style.display = 'none';
	visible = false;
	selected = null;
}

function show() {
	$("suggestions").style.display = 'block';
	visible = true;	
}

var xmlhttp = new XMLHttpRequest();
var url = "test.json";
var selected, search_old, visible;

xmlhttp.onreadystatechange = function() {
	var q = $("search").value.trimLeft();

	if (q.length && this.readyState == 4 && this.status == 200) {
		var data = JSON.parse(this.responseText);
		var $suggestions = $("suggestions");

		// remove all items from list
		while ($suggestions.firstChild) {
			$suggestions.removeChild($suggestions.firstChild);
		}

		// escape special characters (anything non-alphanumeric + space)
		// new trick learned; $& in the replacement string inserts entire match
		q = q.replace(/[^a-z0-9_ ]/gi, '\\$&');

		// new regexp object
		const regex = new RegExp(q, 'gi');
		data.forEach(item => {
			if (regex.test(item.name)) {
				var $li = document.createElement("li");
				$li.innerHTML = item.name.replace(regex, '<b>$&</b>');
				$suggestions.appendChild($li);
			}
		});

		// show only if list of suggestions isn't empty
		if ($suggestions.firstChild) show();
	}
};

$("suggestions").style.width = $("search").offsetWidth + 'px';
$("search").addEventListener('input', e => {
	search_old = null; // reset
	selected = null;
	visible = false;

	if ($("search").value.trimLeft().length) {
		xmlhttp.open("GET", url + '?' + Date.now().toString(), true);
		xmlhttp.send();
	}
	else hide();
});
$("search").addEventListener('blur', e => {
	hide();
});
$("search").addEventListener('keydown', e => {
	if (e.keyCode === key.esc) { // ESC key

		// abort pending ajax request, if any
		if (xmlhttp.readyState > 0 && xmlhttp.readyState < 4) xmlhttp.abort();
		if (visible) {
			if (selected) $("search").value = search_old;
			hide();
		}
	}

	// only handle arrow up & down if any suggestions
	else if (visible && ~[key.up, key.down].indexOf(e.keyCode)) {
		e.preventDefault();

		switch (e.keyCode) {
			case key.down:
			if (selected) {
				selected.classList.remove('selected');
				selected = selected.nextSibling;
			}
			else selected = $("suggestions").firstChild;
			break;

			case key.up:
			if (selected) {
				selected.classList.remove('selected');
				selected = selected.previousSibling;
			}
			else selected = $("suggestions").lastChild;
		}

		if (selected) selected.classList.add('selected');

		// store old value
		search_old = search_old || $("search").value;
		$("search").value = (selected) ? selected.textContent : search_old;
	}
});

$("suggestions").addEventListener('mousedown', e => {
	$("search").value = e.target.textContent;
	e.preventDefault(); // prevents the blur event from firing

	hide();
});