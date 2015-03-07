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
        /* Menu is hidden when menu-hidden class is cascaded upon
         * the menu element.
         */
        it('is hidden by default', function() {
            expect(document.body.classList).toContain("menu-hidden");
        });

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
            var matrix = computedStyle.getPropertyValue("transform");

            // 2d-transform should be in the format matrix(a, b, c, d, tx, ty)
            // tx in our case must be negative - since menu is to
            // the left of the viewport
            var re = /matrix\(.*?,.*?,.*?,.*?,(\s-\d+(?:\.\d*)?),.*?\)/i;
            expect(matrix).toMatch(re);

            var tx = parseInt(matrix.match(re)[1], 10);
            expect(tx).toBeLessThan(0);
        });

         /* TODO: Write a test that ensures the menu changes
          * visibility when the menu icon is clicked. This test
          * should have two expectations: does the menu display when
          * clicked and does it hide when clicked again.
          */
        it('toggles its visibility on click', function() {
            $('.menu-icon-link').trigger('click');
            expect(document.body.classList).not.toContain("menu-hidden");
            $('.menu-icon-link').trigger('click');
            expect(document.body.classList).toContain("menu-hidden");
        });
    });
    /* TODO: Write a new test suite named "Initial Entries" */

        /* TODO: Write a test that ensures when the loadFeed
         * function is called and completes its work, there is at least
         * a single .entry element within the .feed container.
         * Remember, loadFeed() is asynchronous so this test wil require
         * the use of Jasmine's beforeEach and asynchronous done() function.
         */

    /* TODO: Write a new test suite named "New Feed Selection"

        /* TODO: Write a test that ensures when a new feed is loaded
         * by the loadFeed function that the content actually changes.
         * Remember, loadFeed() is asynchronous.
         */
}());
