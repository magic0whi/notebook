# Options

## Option Greeks

Option Greeks are metrics that measure how various factors affect an option’s price (premium). Each Greek quantifies a specific influence, such as the underlying asset’s price, time to expiration, volatility, or interest rates. Named after Greek letters, these metrics help traders understand and manage option price sensitivity.[^1]

**Common Greeks**:
- **Delta** $$\Delta$$: Measures the change in option price relative to the underlying asset’s price.
- **Gamma** $$\Gamma$$: Measures the rate of change in delta.
- **Theta**: Measures the impact of time decay on the option’s price.
- **Vega**: Measures sensitivity to changes in implied volatility.
- **Rho**: Measures sensitivity to changes in interest rates.

### Delta

**Delta** measures how much an option’s price (premium) changes for a $1 change in the price of the underlying asset, such as a futures contract. It is expressed as a decimal between -1 and 1 (e.g., 0.5 or -0.3).

**Definition**: The delta of an option is the rate of change of its price (V) with respect to the price of the underlying (S), denoted as[^2]:
$$
\Delta = \frac{\partial V}{\partial S}
$$

**Key Characteristics**:
- **Call options** have positive deltas (0 to 1), meaning the option price rises with the underlying’s price.
- **Put options** have negative deltas (&minus;1 to 0), meaning the option price falls as the underlying’s price rises.
- **Example**: For a call option priced at $1 with a delta of 0.5, if the underlying futures price increases from $96 to $97.5 (a $1.5 move), the option’s premium increases by $$0.5\times\$1.5=\textcolor{green}{\$0.75}$$, resulting in a new premium of $1.75.
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

### Gamma

**Gamma** measures the rate of change in an option’s delta for a $1 change in the price of the underlying asset. It is often described as the “delta of the delta” or the second derivative of the option’s price (V) with respect to the underlying’s price (S).

**Definition**[^3]:
$$
\gamma=\frac{\partial^2V}{\partial S^2}=\frac{\partial\Delta}{\partial S}
$$

**Key Characteristics**:
- Gamma is expressed as a decimal (e.g., 0.02), representing the change in delta per $1 move in the underlying.
- **Example**: For a call option with a delta of 0.30 and a gamma of 0.02, if the underlying futures price increases from $200 to $201, the delta increases to 0.30 + 0.02 = 0.32. If the underlying decreases to $199, the delta decreases to 0.30 &minus; 0.02 = 0.28.
- Both call and put options have **positive gamma**, as delta becomes more positive (for calls) or less negative (for puts) when the underlying price rises.
- Gamma is highest for at-the-money (ATM) options, where delta is most sensitive to price changes, and decreases for in-the-money (ITM) or out-of-the-money (OTM) options.
- Gamma is dynamic, changing with the underlying’s price, time to expiration, and volatility. It tends to increase as expiration approaches for ATM options.

**Practical Use**: Gamma indicates the stability of an option’s delta. High gamma means delta changes rapidly, increasing risk or opportunity for traders, especially in delta-hedging strategies.

### Theta

TODO

## Tests

1. An option’s premium is $1.50 and has a delta of 0.40, with the underlying future at $100. If the underlying future moves to $102, what is the option’s new premium based on delta?
2. True or False: Call options have positive gamma values and put options have negative gamma values.

### Answers

1. The underlying moves $2 ($100 to $102). With a delta of 0.40, the option’s premium increases by $$0.40\times\$2=\$0.80$$. New premium is $$\$1.50+\$0.80=\bm{\$2.30}$$.
2. False. All options have positive gamma values.

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
[^3]: https://brilliant.org/wiki/option-greeks-gamma/
