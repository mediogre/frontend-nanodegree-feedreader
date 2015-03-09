/* feedreader.js
 *
 * This is the spec file that Jasmine will read and contains
 * all of the tests that will be run against your application.
 */

/* We're placing all of our tests within the $() function,
 * since some of these tests may require DOM elements. We want
 * to ensure they don't run until the DOM is ready.
 */
$(function() {
    /* This is our first test suite - a test suite just contains
     * a related set of tests. This suite is all about the RSS
     * feeds definitions, the allFeeds variable in our application.
     */
    describe('RSS Feeds', function() {
        /* This is our first test - it tests to make sure that the
         * allFeeds variable has been defined and that it is not
         * empty. Experiment with this before you get started on
         * the rest of this project. What happens when you change
         * allFeeds in app.js to be an empty array and refresh the
         * page?
         */
        it('are defined', function() {
            expect(allFeeds).toBeDefined();
            expect(allFeeds.length).not.toBe(0);
        });

        // Check if each url at least roughly looks like an http URL
        it('define URLs', function() {
            for (var i = 0, l = allFeeds.length; i < l; ++i) {
                expect(allFeeds[i].url).toMatch(/^https?:\/\//i);
            }
        });

        // Non empty string is a truthy value - so let's check for that
        it('define names', function() {
            for (var i = 0, l = allFeeds.length; i < l; ++i) {
                expect(allFeeds[i].name).toBeTruthy();
            }
        });
    });

    describe('The menu', function() {
        /* This spec will be used several times in this suite
         * so I'm defining it explicitly to be able to re-use
         * the expectation from multiple specs
         */
        var expectHidden = function() {
            expect(document.body.classList).toContain('menu-hidden');
        };

        /* the counterpart of the above re-usable expectation
         * (be-tofu concept was not lost on me :)
         */
        var expectVisible = function() {
            expect(document.body.classList).not.toContain('menu-hidden');
        };

        /* Menu is hidden when menu-hidden class is cascaded upon
         * the menu element.
         */
        it('is hidden by default', expectHidden);

        /* Another way to check for that is to actually check if the
         * menu's transform places it outside of the viewport.
         * It's a more involved spec and too-coupled to the implementation
         * as well - however being Udacious you'll never know if that
         * might help down the road
         * (being able to write more involved specs that is)
         */
        it('animated away by default', function() {
            var menu = $('.menu')[0];

            // get the transform value from the computer style of the menu
            var computedStyle = window.getComputedStyle(menu, null);
            var matrix = computedStyle.getPropertyValue('transform');

            // 2d-transform should be in the format matrix(a, b, c, d, tx, ty)
            // tx in our case must be negative - since menu is to
            // the left of the viewport
            var re = /matrix\(.*?,.*?,.*?,.*?,(\s-\d+(?:\.\d*)?),.*?\)/i;
            expect(matrix).toMatch(re);

            var tx = parseInt(matrix.match(re)[1], 10);
            expect(tx).toBeLessThan(0);
        });

        // clicking on the menu toggles its visibility
        it('toggles its visibility on click', function() {
            var icon = $('.menu-icon-link');

            icon.trigger('click');
            expectVisible();

            icon.trigger('click');
            expectHidden();
        });
    });

    describe('Initial Entries', function() {
        /* using callback facility of loadFeed
         * to ensure that loadFeed fully completes
         * before each spec of this suite is run
         */
        beforeEach(function(done) {
            loadFeed(0, done);
        });

        /* Assuming that loadFeed has not errored out,
         * we can now check if entries have been populated
         */
        it('appear after loadFeed call', function() {
            // we are interested in every .entry under the .feed
            var entries = $('.entry', $('.feed'));
            expect(entries.length).toBeGreaterThan(0);
        });
    });

    describe('New Feed Selection', function() {
        // return titles of each entry populated by loadFeed
        var titles = function() {
            var entries = $('.entry', $('.feed'));
            return entries.map(function(_, entry) {
                return $('h2', entry).text();
            });
        };

        // this will create a callback that can be passed to loadFeed
        // internally it handles all the gory details of:
        // - comparing titles (which we equate to having new entries loaded)
        // - signaling Jasmine that async spec is finished
        var compareTitlesCb = function(done) {
            // grab the current titles
            var initialTitles = titles();

            // this function can now be passed to loadFeed as a callback
            // it will grab (hopefully) new titles,
            // compare them against the previous ones,
            // and be kind enough to signal Jasmine that we are done
            return function() {
                // grab updated titles
                var newTitles = titles();

                expect(newTitles).not.toEqual(initialTitles);

                // signal Jasmine that we are done with this spec
                done();
            };
        };

        // loading first feed source before each spec
        beforeEach(function(done) {
            loadFeed(0, done);
        });

        // change the feed and ensure that new entries apppear
        it('updates the entries', function(done) {
            loadFeed(1, compareTitlesCb(done));
        });

        // the same as the spec above, but instead of programmatically
        // loading the feed, we try to actually 'click' another
        // feed link from the menu
        it('clicking on another feed loads its entries', function(done) {
            // the real loadFeed
            var lf = loadFeed;

            // replace global loadFeed with our spy,
            // which will call the real loadFeed with our callback,
            // which will check all the expectations
            spyOn(window, 'loadFeed').and.callFake(function(feed_id) {
                lf(feed_id, compareTitlesCb(done));
            });

            // click on the second feed
            var link = $('a', $('.feed-list'))[1];
            $(link).trigger('click');
        });
    });

    describe('API mocking', function() {
        beforeEach(function() {
            // clean up feed results and feed title
            // we'll be using mocked json to get them back shortly
            $('.header-title').empty();
            $('.feed').empty();
        });

        // example of what Google Feed Reader API returns
        var feed_mock = {
            error: undefined,
            feed: {
                "feedUrl": "http://blog.udacity.com/feeds/posts/default?alt\u003drss",
                "title": "Udacity Blog",
                "link": "http://blog.udacity.com/",
                "author": "",
                "description": "Advance your education and your career with project-based, self-paced online courses in tech.",
                "type":"rss20",
                "entries": [
                    {"title":"4 Times Data Science Saved the Day",
                     "link":"http://blog.udacity.com/2014/12/4-times-data-science-saved-day_3.html",
                     "author":"noreply@blogger.com (Mark Nguyen)",
                     "publishedDate":"Wed, 03 Dec 2014 10:31:00 -0800",
                     "contentSnippet":"",
                     "content":"",
                     "categories":["Data Science"]
                    },
                    {"title":"Dawoon Choi: Golfer to Programmer",
                     "link":"http://blog.udacity.com/2014/11/student-stories-dawoon-choi-programmer.html",
                     "author":"noreply@blogger.com (ChiWei Ranck)",
                     "publishedDate":"Fri, 28 Nov 2014 07:26:00 -0800",
                     "contentSnippet":"",
                     "content":"",
                     "categories":["front-end web dev","Nanodegrees","Student Stories"]
                    },
                    {"title":"Data Analysts: What You\'ll Make and Where You\'ll Make It",
                     "link":"http://blog.udacity.com/2014/11/data-analysts-what-youll-make.html",
                     "author":"noreply@blogger.com (Allison Stadd)",
                     "publishedDate":"Wed, 26 Nov 2014 08:00:00 -0800",
                     "contentSnippet":"",
                     "content":"",
                     "categories":["Careers","Data Science"]
                    },
                    {"title":"Informational Interviews: How to Find Your Next Job Over Coffee",
                     "link":"http://blog.udacity.com/2014/11/informational-interviews-how-to-find.html",
                     "author":"noreply@blogger.com (Allison Jones)",
                     "publishedDate":"Fri, 21 Nov 2014 08:50:00 -0800",
                     "contentSnippet":"",
                     "content":"",
                     "categories":["Careers"]
                    }
                ]
            }
        };

        it('ensures all feed data is rendered correctly', function() {
            // having better designed functions allows to test things more
            // comfortably, just rendering the received feed,
            // no async handling required
            renderFeed(feed_mock);

            var entries = $('.entry', $('.feed'));

            // since we know exactly what "feed API" will have returned
            // we can make exact expectations
            expect(entries.length).toBe(4);

            var feed = feed_mock.feed;
            // check that title has been properly updated
            expect($('.header-title').text()).toBe(feed.title);

            for (var i = 0, l = entries.length; i < l; ++i) {
                var entry = entries[i];
                var feedEntry = feed.entries[i];

                // check feed title, contentSnippet and link
                expect($('h2', entry).text()).toBe(feedEntry.title);
                expect($('p', entry).text()).toBe(feedEntry.contentSnippet);
                expect($(entry).parent().attr('href')).toBe(feedEntry.link);
            }
        });
    });
}());
