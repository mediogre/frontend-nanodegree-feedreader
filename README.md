# How to run
Just open index.html in your browser - all the specs will run automatically and should all pass.

# Extra Test Coverage
* an extra spec - "animated away by default" was added
It checks if actual transform has been applied to then menu.
I believe the "default" test expected from us was to check if particular class was applied.
This was done in 'The menu is hidden by default', and it is a spec that simply relies on the 'menu-hidden' class to "do its thing".
However we can check the "current implementation" of that css rule as well.
The downside of this is that the spec is now too coupled with the implementation now and probably
would have to be removed/refactored frequently (as the implementation of "menu hiding" changes).
But on the upside, we can be more "sure" that menu is actually "invisible" with this one.

* an extra spec - 'New Feed Selection clicking on another feed loads its entries'
This one tests the scenario of actually clicking on a feed in the menu,
and observing the changes after the feed has been loaded.
nloadFeed global function is stubbed with the spy which will call it eventually with the original argument, but will also add a callback in which we'll perform all the checks.

* an extra spec - 'API mocking ensures all feed data is rendered correctly'
For this to be possible, I've refactored loadFeed function a little bit
by splitting it into explicit "loading" and "rendering" parts:
- loadFeeWithGoogle - which as its name implies simply loads the feed and calls the provided callback(s)
- renderFeed is just concerned with rendering somehow obtained feed results.
In passing I've also eliminated Handlebars templating compiling on each render.
tpl-entry is compiled once and then re-used by each rendering.
Now that renderFeed is easily testable, I've captured JSON returned by real API call,
and can use it to thoroughly test the rendering part.
