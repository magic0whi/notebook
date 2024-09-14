## Affine Transformations (3-D)

### Rotation

- Pitch (Rotate around x-axis):
  $$
  \begin{equation}
  \mathbf R_x=
  \begin{bmatrix*}[r]
  1 & &\\
    & \cos\theta & -\sin\theta\\
    & \sin\theta & \cos\theta
  \end{bmatrix*}
  \end{equation}
  $$
- Roll (Rotate around y-axis)
  $$
  \begin{equation}
  \mathbf R_y=
  \begin{bmatrix*}[r]
  \cos\theta &   & -\sin\theta\\
             & 1 &            \\
  \sin\theta &   & \cos\theta
  \end{bmatrix*}
  \end{equation}
  $$
- Yaw (Rotate around z-axis)
  $$
  \begin{equation}
  \mathbf R_z=
  \begin{bmatrix*}[r]
  \cos\theta & -\sin\theta &\\
  \sin\theta & \cos\theta  &\\
             &             & 1\\
  \end{bmatrix*}
  \end{equation}
  $$


Proof in 2-D:
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
,\\\downarrow\\
\begin{cases}
x^\prime=x\cos\theta-y\sin\theta\\
y^\prime=x\sin\theta+y\cos\theta
\end{cases}
\to
\begin{cases}
x^\prime=x\cos\theta-y\sin\theta\\
y^\prime=x\sin\theta+y\cos\theta
\end{cases}
,\\\downarrow\\
\begin{bmatrix}
\cos\theta & -\sin\theta\\
\sin\theta & \cos\theta
\end{bmatrix}
\begin{bmatrix}
x\\y
\end{bmatrix}
=
\begin{bmatrix}
x^\prime\\y^\prime
\end{bmatrix}
.
\end{gathered}
$$

<img class="center" src="figures/computer-graphics-note-1.svg" alt="Rotate Transformation" style="width:100%">

## Scaling

$$
\begin{gathered}
\begin{aligned}
x^\prime=s_x\cdot x\\
y^\prime=s_y\cdot y
\end{aligned}
\\\downarrow\\
\begin{bmatrix}x^\prime\\y^\prime\end{bmatrix}
=
\begin{bmatrix}
s_x &\\
    & s_y
\end{bmatrix}
\begin{bmatrix}x\\y\end{bmatrix}
\end{gathered}
$$

## Translation

$$
\begin{gathered}
\begin{aligned}
x^\prime=x+t_x\\
x^\prime=y+t_y
\end{aligned}
\\\downarrow\\
\begin{bmatrix}x^\prime\\y^\prime\\1\end{bmatrix}
=
\begin{bmatrix}
1 &   & t_x\\
  & 1 & t_y\\
  &   & 1
\end{bmatrix}
\begin{bmatrix}x\\y\\1\end{bmatrix}
\end{gathered}
$$
