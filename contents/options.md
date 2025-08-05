# Options

## Option Greeks

### Options Delta

# Options

## Option Greeks

### Options Delta

**Delta** measures how much an option’s price (premium) changes for a $1 change in the price of the underlying asset, such as a futures contract. It is expressed as a decimal between -1 and 1 (e.g., 0.5 or -0.3).[^1]

**Definition**: The delta of an option is the rate of change of its price (V) with respect to the price of the underlying (S), denoted as[^2]:
$$
\Delta = \frac{\partial V}{\partial S}
$$

**Key Characteristics**:
- **Call options** have positive deltas (0 to 1), meaning the option price rises with the underlying’s price.
- **Put options** have negative deltas (-1 to 0), meaning the option price falls as the underlying’s price rises.
- **Example**: For a call option priced at $1 with a delta of 0.5, if the underlying futures price increases from $96 to $97.5 (a $1.5 move), the option’s premium increases by 0.5 × $1.5 = $0.75, resulting in a new premium of $1.75.
- Delta also approximates the probability an option will expire in-the-money. For example, a delta of 0.2 suggests a ~20% chance, while 0.5 suggests a ~50% chance.
- **Moneyness**:
  - Delta < 0.5: Out-of-the-money (OTM).
  - Delta &asymp; 0.5: At-the-money (ATM).
  - Delta > 0.5: In-the-money (ITM).
- Delta is dynamic, changing with the underlying’s price, time to expiration, and volatility.

**Delta and Position**:

| | Future | Call | Put |
| - | - | - | - |
| Long | + | + | - |
| Short | - | - | + |

> Futures contracts have a fixed delta of 1.0.

**Hedging with Delta**: Delta is used to calculate hedge ratios for delta-neutral positions. For example, if you sell 8 call options with a delta of 0.25 (total delta is $$8\times0.25=-2.0$$), you need to buy 2 futures contracts (delta = 2.0) to achieve a delta-neutral position.

## Tests

1. An option’s premium is $1.50 and has a delta of 0.40, with the underlying future at $100. If the underlying future moves to $102, what is the option’s new premium based on delta?

### Answers

1. The underlying moves $2 ($100 to $102). With a delta of 0.40, the option’s premium increases by $$0.40\times\$2=\$0.80$$. New premium is $$\$1.50+\$0.80=\bm{\$2.30}$$.

## References

[^1]: CME Group, "Options Delta - The Greeks," https://www.cmegroup.com/education/courses/option-greeks/options-delta-the-greeks.html  
[^2]: Brilliant, "Option Greeks - Delta," https://brilliant.org/wiki/option-greeks-delta/

## Tests

1. An option's premium is $1.50 and has a .40 delta with the underlying future at 100. If the underlying future moved from 100 to 102, what would the option's new premium be based on delta?

### Answers

1. $2.3.

## References

[^1]: https://www.cmegroup.com/education/courses/option-greeks/options-delta-the-greeks.html
[^2]: https://brilliant.org/wiki/option-greeks-delta/
