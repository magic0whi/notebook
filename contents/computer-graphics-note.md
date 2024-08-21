## 3-D Transformations

$$
\begin{gathered}
\begin{cases}
x=r\cos\alpha\\
y=r\sin\alpha
\end{cases}
\to
\begin{cases}
x^\prime=r\cos(\alpha+\theta)=x\cos\theta-y\sin\theta\\
y^\prime=r\sin(\alpha+\theta)=x\sin\theta+y\cos\theta
\end{cases}
\\\darr\\
\begin{cases}
x^\prime=x\cos\theta-y\sin\theta\\
y^\prime=x\sin\theta+y\cos\theta
\end{cases}
\to
\begin{cases}
x^\prime=x\cos\theta-y\sin\theta\\
y^\prime=x\sin\theta+y\cos\theta
\end{cases}
\\\darr\\
\begin{bmatrix}
\cos\theta & -\sin\theta\\
\sin\theta & \cos\theta
\end{bmatrix}
\begin{bmatrix}
x\\y
\end{bmatrix}
=
\begin{bmatrix}
x^\prime\\
y^\prime
\end{bmatrix}
\end{gathered}
$$
