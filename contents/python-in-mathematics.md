## Rational Numbers

```python
Rational(1, 2)
Rational('1/2')
```

## Constants & Physical Units

```python
from sympy.physics.units.quantities import Quantity
Q = Quantity('Q')

from sympy.physics.units import convert_to, speed_of_light, meters, seconds, liters, hours, centimeters
display(convert_to(speed_of_light, [meter, second]))

from sympy.physics.units.util import quantity_simplify
display((meter/kilometer).simplify())
```

## Filter Results in Range for Non-linear Equations

```python
x, y, z = symbols('x y z', real=True)
domains = [Interval(-10, 10), Interval(-10, 10), Interval(-10, 10)] # The domain for each variable
eq1 = z - x*y
eq2 = z - cos(x) - sin(y)
eq3 = z + x*y
sols = nonlinsolve([eq1, eq2, eq3], [x, y, z]) # Please make sure the solution set is reasonable.
display(Markdown('Solution set:'))
display(sols)

filtered_sols, _n = [], Symbol("n", integer=True)
assert isinstance(sols, Set)
for sol in sols.args:
  assert isinstance(sol, Tuple) # Each solution should be a Tuple if in 2D or higher
  fil_sol_vs = []
  for i, sol_v in enumerate(sol):
    if isinstance(sol_v, Set): fil_sol_v = list(sol_v.intersect(domains[i])) # Filtrate using intersect
    else:
      assert isinstance(sol_v, Expr)
      if _n.name in [s.name for s in sol_v.free_symbols]: # Substitute n for some sample values
        _n = [s for s in sol_v.free_symbols if s.name == _n.name][0] # Change _n to the solution's _n since they have different hidden properties
        fil_sol_v = [sol_v.subs(_n, n) for n in range(-10, 10) if sol_v.subs(_n, n) in domains[i]]
      elif len(sol_v.free_symbols) == 0: fil_sol_v = [sol_v] if sol_v in domains[i] else [] # Or just have a single number
      else: fil_sol_v = [sol_v] # Or an 'Expr' that depends on x or y, assume this value is in the domain
    fil_sol_vs.append(set(fil_sol_v)) # Remove duplicates with hashset
  filtered_sols += itertools.product(*fil_sol_vs) # Regenerate solutions with cartesian product.
filtered_sols = list(set(filtered_sols)) # Remove duplicates again to be safe with hashset but then retain ordering with list
display(Markdown('`Expr` values:'))
for i in filtered_sols: display([i]) # Turn it into a list since the output below is also a list.
display(Markdown('`float` values:'))
for i in filtered_sols: display([N(j) for j in i])
```

## Analyze a Function Using SymPy & Matplotlib

```python
from sympy import init_session
from sympy.parsing.latex import parse_latex
from IPython.display import Math

init_session()

f = x + 8000 / x
pprint(f) # Pretty print (for console)
# Display f, f', f''
display(Math(f'f={latex(f)}')) # Display in LaTeX form (for JupyterLab)
display(Math(f'f^\\prime={latex(simplify(f.diff()))}')) 
display(Math(f'f^{{\\prime\\prime}}={latex(simplify(f.diff(x, 2)))}')) # or f.diff(x, x)
display([N(i) for i in solveset(f.diff(), x).args]) # Solve f'=0, N() gets numeric value
display(Math(f'f^\\prime(80)={latex(f.diff().evalf(subs={x:80}))}')) # Display f'(80) using f.evalf() (numeric value)
display(Math(f'f^\\prime(80)={latex(f.diff().subs(x, 80))}')) # Or using f.subs()
display(Math(f'\\lim_{{x\\to 0}}f(x)={latex(limit(f,x, 0))}')) # Display limit f(x) as x approaches 0

# Print the limit at x approaches plus/minus infinity
pprint("Limit: {}".format(limit(f, x, -oo)))
pprint("Limit: {}".format(limit(f, x, oo)))

# Plot the function
p = plot((f, (x, -100, 100)), legend=True, show=False)
for i, n in enumerate(p): p[i].label = p[i].get_label(use_latex=True) # Use LaTeX form
p.show()
# Or use matplotlib
xs, ys = p[0].get_points()
fig, ax = plt.subplots()
ax.axis([-100, 100, -1e4, 1e4]) # Limit the x/y-axis' size
ax.grid(True, which='both') # Show grids
ax.axhline(y=0, color='k'), ax.axvline(x=0, color='k') # Set the x/y-spine color
ax.spines['left'].set_position('zero'), ax.spines['bottom'].set_position('zero') # Set the x/y-spine
ax.spines['right'].set_color('none'), ax.spines['top'].set_color('none') # Turn off the right/top spine
ax.yaxis.tick_left(), ax.xaxis.tick_bottom() # Set the position of x/y-axis's ticks
l1, = ax.plot(xs, ys, label=p[0].get_label(use_latex=True))
ax.legend()
plt.show()
```

## Implicit Differentiation in SymPy

```python
a, b = symbols('a b')
y = Function('y')(x)
f = sqrt(x**2+y**2)+sqrt((a-x)**2+(b-y)**2)
display(f)
display(diff(f, x))
idiff(f, y, x) # Or if you want to resolve dy/dx totally
```

## Reference

1. [Implicit Differentiation Sympy](https://stackoverflow.com/a/35487338/26004653)
2. [Displaying solutions within a certain range when using sympy solve command](https://stackoverflow.com/a/62171487/26004653)
