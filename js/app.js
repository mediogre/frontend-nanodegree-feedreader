/* app.js
 *
 * This is our RSS feed reader application. It uses the Google
 * Feed Reader API to grab RSS feeds as JSON object we can make
 * use of. It also uses the Handlebars templating library and
 * jQuery.
 */

// The names and URLs to all of the feeds we'd like available.
var allFeeds = [
    {
        name: 'Udacity Blog',
        url: 'http://blog.udacity.com/feeds/posts/default?alt=rss'
    }, {
        name: 'CSS Tricks',
        url: 'http://css-tricks.com/feed'
    }, {
        name: 'HTML5 Rocks',
        url: 'http://feeds.feedburner.com/html5rocks'
    }, {
        name: 'Linear Digressions',
        url: 'http://feeds.feedburner.com/udacity-linear-digressions'
    }
];

/* This function starts up our application. The Google Feed
 * Reader API is loaded asynchonously and will then call this
 * function when the API is loaded.
 */
function init() {
    // Load the first feed we've defined (index of 0).
    loadFeed(0);
}

/**
 * Actual feed loading attempted here using the Google Feed Reader API
 * Having this one as a separate function make it possible to stub it out
 * for easier testing.
 * @param {string} feedUrl - url to load
 * @param {function(feedResult)} feedHandler - the function callback to call
 *                                             when the feed download completes
 * @param {function()} extraCb - additional callback to call after feedHandler
 */
function loadFeedWithGoogle(feedUrl, feedHandler, extraCb) {
    var feed = new google.feeds.Feed(feedUrl);

    /* Load the feed using the Google Feed Reader API.
     * Once the feed has been loaded, the callback function
     * is executed.
     */
    feed.load(function(result) {
        feedHandler(result);
        extraCb && extraCb();
    });
}

// This will contain compiled handlebars template for entry
var entryTemplate = null;

/**
 * This function is supposed to receive feed
 * @param result - feed object returned by Feed Reader API
 */
function renderFeed(result) {
    if (result.error) {
        // report the error somehow
        return;
    }

    /* If loading the feed did not result in an error,
     * get started making the DOM manipulations required
     * to display the feed entries on screen.
     */
    var container = $('.feed'),
        title = $('.header-title'),
        entries = result.feed.entries,
        entriesLen = entries.length;

    title.html(result.feed.title);

    // compile template once and save it for subsequent re-use
    if (! entryTemplate) {
        entryTemplate = Handlebars.compile($('.tpl-entry').html());
    }

    // Empty out all previous entries
    container.empty();

    /* Loop through the entries we just loaded via the Google
     * Feed Reader API. We'll then parse that entry against the
     * entryTemplate (created above using Handlebars) and append
     * the resulting HTML to the list of entries on the page.
     */
    entries.forEach(function(entry) {
        container.append(entryTemplate(entry));
    });
}

/* This function performs everything necessary to load a
 * feed using the Google Feed Reader API. It will then
 * perform all of the DOM operations required to display
 * feed entries on the page. Feeds are referenced by their
 * index position within the allFeeds array.
 * This function all supports a callback as the second parameter
 * which will be called after everything has run successfully.
 */
function loadFeed(id, cb) {
    var feedUrl = allFeeds[id].url,
        feedName = allFeeds[id].name;

    loadFeedWithGoogle(feedUrl, renderFeed, cb);
 }

/* Google API: Loads the Feed Reader API and defines what function
 * to call when the Feed Reader API is done loading.
 */
google.load('feeds', '1');
google.setOnLoadCallback(init);

/* All of this functionality is heavily reliant upon the DOM, so we
 * place our code in the $() function to ensure it doesn't execute
 * until the DOM is ready.
 */
$(function() {
    var container = $('.feed'),
        feedList = $('.feed-list'),
        feedItemTemplate = Handlebars.compile($('.tpl-feed-list-item').html()),
        feedId = 0,
        menuIcon = $('.menu-icon-link');

    /* Loop through all of our feeds, assigning an id property to
     * each of the feeds based upon its index within the array.
     * Then parse that feed against the feedItemTemplate (created
     * above using Handlebars) and append it to the list of all
     * available feeds within the menu.
     */
    allFeeds.forEach(function(feed) {
        feed.id = feedId;
        feedList.append(feedItemTemplate(feed));

        feedId++;
    });

    /* When a link in our feedList is clicked on, we want to hide
     * the menu, load the feed, and prevent the default action
     * (following the link) from occuring.
     */
    feedList.on('click', 'a', function() {
        var item = $(this);

        $('body').addClass('menu-hidden');
        loadFeed(item.data('id'));
        return false;
    });

    /* When the menu icon is clicked on, we need to toggle a class
     * on the body to perform the hiding/showing of our menu.
     */
    menuIcon.on('click', function() {
        $('body').toggleClass('menu-hidden');
    });
}());
