## Getting Started

First, install the dependencies with:

```bash
pnpm i
```

and copy the `.env.example` into a `.env` file where you'll add your API key for FunKit

```bash
cp .env.example .env
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To run a built version of the app, run:

```bash
pnpm build && pnpm start
```

Likewise, open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Design and Implementation Considerations

The goal here was to make this project maintainable and scalable with clean architecture patterns. Moreover, the resulting application was optimized to make it fast, responsive, with minimum content layout shift while also handling extreme cases like large numbers, or large decimal points.

### State Management

We could have opted for more complex state machine libraries like XState, but given the scope of this project, we kept it simple by leveraging `useReducer`:

- bundled in React
- allows for relatively complex and typed state machines
- easily testable with unit tests

This helped us maintain complex interrelated state and avoid repetitive field declarations while also making it easy to extend with new behaviors or new fields.
Finally, this decision also allowed us to isolate all state types, reducer logic, and actions from the UI, keeping the user-facing code clean and readable.

### Separation of Concerns

The scale of the project was small yet still mandated some separation of concerns:

- Styles are scoped with their related components
- Anything related to API calls has been extracted into reusable functions alongside their dependencies.

### Behaviors and other optimizations

The goal here was to make the UI as controlled as possible and try not to rely on side effects (`useEffect`) too much, as they can, over time, have unforeseen behaviors and cause infinite loops. Thus we have,

- Abstracted utilities `fetchTargetToken` `fetchSourceToken` that, once called, will dispatch the necessary reducer actions, call the API and fill the state as defined in the reducer.
- Those functions are only called:
  - "On render" when the page loads -> we want to show some default data to the user rather than an empty state that could be less useful.
  - "On token change", when either token (source or target) is changed via their respective select dropdown, we will respectively call either utility function. Each "source" and "target" token has their respective "loading" state. This allows us to have targeted updates when changing the token type, and maintain valid data on screen.
  - "On USD amount change" -> we want to fetch both source and target token data as we have to recompute the ratios anyways, and may as well use this to fetch the latest pricing information.

Note: This is what made the most sense UX wise, however, we could argue that there's a potential case to be made to always fetch both token (source and target) pricing data regardless to have the most up to date pricing information.

Whenever the USD amount changes, since it's a user typing event, we are debouncing the calls to fetch the tokens to avoid over fetching and displaying stale data that may be overridden very quickly on the following keystroke. `400ms` was picked as:

- it's slow enough to let slow typers (like me) type the full amount.
- it's fast enough to keep the UI feeling responsive.

Selecting other token types immediately triggers the call as it's a more intentional action (requires 2 clicks), thus there is less risk of "calling the API too many times" for these inputs.

Here's a list of other UI considerations

- The fields are displayed in order of input: first the USD amount (required), then the source token and finally the target token.
- We can use the UI with keyboard only (tab, arrow navigation for the select options, etc).
- We use `font-variant-numeric: tabular-nums;` to have a consistent space footprint for numbers and thus avoid any layout shift.
- The number input has been stripped out of its "arrows" as we're more likely to type large/long numbers. Moreover, we allowed typing decimals (using the US notation `.` This allows for the user to type small amounts like `0.0000123` or large amounts like `10234.789`). The characters `e` `E` `+` and `-` are actively skipped as we considered it fairly unlikely that users will type a USD amount in _scientific notation_. It could also cause some input validation issues like `12345--`.
- The resulting price information is displayed in the locale of the user (e.g. 1000.00000000 -> 1,000.00 for US, 1.000,00 for DE or 1 000,00 for FR). We also dynamically allow more decimals based on the number to display (e.g. small numbers below 1 allow 4 decimals, below 0.01 we display 8 decimals, otherwise 2). We also switch to scientific notation for very very large numbers as we did not cap the USD amount that could be typed in the amount input. Other similar products, like uniswap, did not cap the amount that could be input either.
- We also adjust the font size for large numbers, again to cater to any size of numbers, small or large, in any notations. This avoids content layout shift or crucial information being hidden as too large to display.
- Below the resulting amount per token, we also display the unit price to USD of the selected token. This way the user could get both USD to Token rate (from the USD input), and the opposite, Token to USD rate.
- When no amount is specified, we default to a `$0.00` amount, and still allow the user to see the resulting rate of token to USD which is useful information we probably want to keep displayed as an empty state.
- Loading states are on purpose subtle, we scale down, reduce the opacity, and blur the data while it's changing to avoid content layout shift, make the transition fluid for when the API call is very quick, while also making it obvious we're transitioning for times when the API may take longer to respond (it wasn't the case during development, every API call was extremely fast).

Other notes:

- The token list is hardcoded under `constants.ts`
- Adding support for a token is just a matter of adding another entry to said object.
- API calls through the FunKit SDK were kept on the client, although we could have abstracted that behind a Next.js API endpoint. This wasn't 100% necessary here as the SDK did work client side. However, if the API key provided was not supposed to be public, I'd retract this statement, and implement an API endpoint.
- We kept a "top to bottom" layout given the time allocated to make this UI gracefully handle smartphone aspect ratios.
- We can select twice the same token (source and target). Not necessarily wrong nor the most correct either. This could be tweaked if we were to deem that the user may be confused by this UI (other similar products did not prevent this unless for those letting the user perform an action on chain as a result of the input, which is not the case here)
