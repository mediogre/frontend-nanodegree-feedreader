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
        // this spec will be used several times in this suite
        // so I'm defining it explicitly to be able to re-use
        // the expectation from multiple specs
        var expectHidden = function() {
            expect(document.body.classList).toContain('menu-hidden');
        };

        // the counterpart of above re-usable expectation
        // (be-tofu concept was not lost on me :)
        var expectVisible = function() {
            expect(document.body.classList).not.toContain('menu-hidden');
        };

        /* Menu is hidden when menu-hidden class is cascaded upon
         * the menu element.
         */
        it('is hidden by default', expectHidden);

        /* Another way to check for that is to actually check if the
         * menu's transform places it outside the viewport.
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
            $('.menu-icon-link').trigger('click');
            expectVisible();

            $('.menu-icon-link').trigger('click');
            expectHidden();
        });
    });

    describe('Initial Entries', function() {
        beforeEach(function(done) {
            loadFeed(0, done);
        });

        /* TODO: Write a test that ensures when the loadFeed
         * function is called and completes its work, there is at least
         * a single .entry element within the .feed container.
         * Remember, loadFeed() is asynchronous so this test wil require
         * the use of Jasmine's beforeEach and asynchronous done() function.
         */
        it('appear after loadFeed call', function() {
            var entries = $('.entry', $('.feed'));
            expect(entries.length).toBeGreaterThan(0);
        });
    });

    describe('New Feed Selection', function() {
        beforeEach(function(done) {
            loadFeed(0, done);
        });

        // return titles of each entry populated by loadFeed
        var titles = function() {
            var entries = $('.entry', $('.feed'));
            return entries.map(function(_, entry) {
                return $('h2', entry).text();
            });
        };

        var expectNewEntries = function(done) {
           var initialTitles = titles();

            // load another feed (with index 1)
            // and ensure new titles have been loaded
            loadFeed(1, function() {
                var newTitles = titles();
                expect(newTitles).not.toEqual(initialTitles);

                // signal Jasmine that we are done with this spec
                done();
            });
        };

        // change the feed and ensure that new entries apppear
        it('updates the entries', function(done) {
            expectNewEntries(done);
        });

        it('clicking on another feed loads its entries', function(done) {
            var lf = loadFeed;
            var initialTitles = titles();
            spyOn(window, 'loadFeed').and.callFake(function(feed_id) {
                lf(feed_id, function() {
                    var newTitles = titles();
                    expect(newTitles).not.toEqual(initialTitles);

                    // signal Jasmine that we are done with this spec
                    done();
                });
            });
            $($('a', $('.feed-list'))[1]).trigger('click');
        });
    });
}());
