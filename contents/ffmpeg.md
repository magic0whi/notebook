# FFmpeg

## Common Operations

- View video information:
  ```bash
  ffprobe -v quiet -print_format json -show_format -show_streams output.mkv
  ```
  Show video duration:
  ```bash
  ffprobe -select_streams v:0 -show_entries stream=duration \
    -of 'default=noprint_wrappers=1:nokey=1' output.mkv
  ```
- Change video resolution:
  ```bash
  -vf scale=854x480
  ```
- `x265` parameters for anime encoding (VCB-Studio[^4])
  ```bash
  <stdout> | x265 --y4m -D 10 --preset slower --deblock -1:-1 --ctu 32 \
    --qg-size 8 --crf 15.0 --pbratio 1.2 --cbqpoffs -2 --crqpoffs -2 --no-sao \
    --me 3 --subme 5 --merange 38 --b-intra --limit-tu 4 --no-amp --ref 4 \
    --weightb --keyint 360 --min-keyint 1 --bframes 6 --aq-mode 1 \
    --aq-strength 0.8 --rd 5 --psy-rd 2.0 --psy-rdoq 1.0 --rdoq-level 2 \
    --no-open-gop --rc-lookahead 80 --scenecut 40 --qcomp 0.65 \
    --no-strong-intra-smoothing --output "output.hevc" -
  ```
- `x264` parameters for anime encoding (Myself):
  ```bash
  ffmpeg -i input.mp4 -c:v libx264 -preset slow -pix_fmt yuv420p -x264-params \
  "crf=28:threads=4:deblock=-1,-1:keyint=600:min-keyint=1:bframes=8:ref=4 \
  :qcomp=0.55:rc-lookahead=70:aq-mode=1:aq-strength=0.8:me=umh:subme=7 \
  :me_range=16:psy-rd=1.3,0.15" -c:a copy output.mp4
  ```
- H.265 10-bit parameters for common usage (Myself):
  ```bash
   ffmpeg -i input.mp4 -c:v libx265 -pix_fmt yuv420p10le -preset slower \
     -x265-params "deblock=-1,-1:ctu=32:qg-size=8:crf=28.0:cbqpoffs=-2 \
     :crqpoffs=-2:me=3:subme=3:merange=20:limit-tu=4:no-amp=true:ref=4 \
     :weightb=true:keyint=600:min-keyint=1:bframes=6:aq-mode=1:aq-strength=0.8 \
     :rd=5:psy-rd=1.5:psy-rdoq=1.0:rdoq-level=1:rc-lookahead=60:scenecut=40 \
     :qcomp=0.65" -acodec aac -ac 2 -ab 79k -ar 48000 output.mp4
  ```
  - For 8-bit encoding, use `-pix_fmt yuvj420p` instead.
- H.265 hardware encoding via VA-API (fewer parameters compared to software encoding):
  ```bash
  ffmpeg -hwaccel vaapi -hwaccel_device /dev/dri/renderD128 \
    -vaapi_device /dev/dri/renderD128 -i input.mkv -vf 'format=nv12,hwupload' \
    -c:v hevc_vaapi -crf 26 -r 24 -acodec aac \
    -strict -2 -ac 2 -ab 192k -ar 44100 -f mp4 -y output.mp4
  ```
- H.264 hardware encoding via NVENC (limited parameters, only medium, slow, fast presets available)
  TODO: clarify the two-pass encoding process.
  ```bash
  ffmpeg -hwaccel cuvid -c:v h264_cuvid -i input.mkv -c:v h264_nvenc \
    -preset slow -b:v 2048k -bufsize 4096 -r 30 -profile:v high -level:v 4.1 \
    -acodec aac -strict -2 -ac 2 -ab 192k -ar 44100 -pass 1 \
    -f matroska output.mkv -y
  ```

## Parameters Explanations

### Encoding Mode

`--qp`: Quantization Parameter (QP), corresponds to Constant Quantizer (CQ) mode, default value is `23`.
> CQ Mode (Constant Quantizer): Uses a fixed quantizer for all P-frames. The quantizer (`0`–`69`, floating-point) measures compression level, where `0` is lossless, and higher values increase compression, reducing bitrate.

> Quantizer doesn’t always reflect visual quality. For example, a solid-color image can use a high quantizer with minimal size, while a complex image may look poor even with a low quantizer. Therefore, CQ mode is often replaced by CRF (Constant Rate Factor) mode, as quantizers don’t reliably represent quality. However, the quantizer concept persists, with encoders dynamically adjusting QP values.

`--crf`: Constant Rate Factor mode, maintains consistent visual quality. Default: `23.0` (`x264`), `28.0` (`x265`).

> In H.264, it uses a psycho-visually derived Rate Factor (RF, 0 = lossless, higher = worse quality) to balance quality across frames, optimizing bitrate allocation. It’s the most commonly used mode.

H.264 Recommendations:
- General videos: CRF `18`–`26`, typically `19`–`21.5` for good quality rips. Use `16` for near-lossless quality (high bitrate).
- Anime (VCB-Studio, 10-bit 1080p BDRip): CRF `16`–`18`.

H.265 Recommendations:
- General encoding: CRF &ge; `23`.
- High-quality anime: CRF &ge; `8.0`.

> Note: CRF’s visual outcome varies with other parameters, so it doesn’t solely determine quality.

`--preset`: Efficiency preset, automatically adjusts parameters to balance speed and quality.
- Fastest (`ultrafast`) rivals GPU acceleration; slowest (`placebo`) can be ~100x slower. Slower presets improve bitrate efficiency (better quality per bitrate).
- Recommended: `slow`, `slower`, or `veryslow`. (VCB-Studio typically uses `veryslow`)

`--y4m`: Uses YUV420p color space for input/output.

`-D`, `--depth`: Output bit-depth, e.g., `--depth 10` for 10-bit encoding.

### Deblocking

`--deblock alpha:beta`: Removes block artifacts from macroblock-based encoding, which can cause visible boundaries. Always enabled. Default `0:0`, reasonable range `-3:-3` to `3:3`. Lower values for high-bitrate encoding to avoid blurring; `-1:-1` is often sufficient.

> Deblock strength scales with QP: lower QP (higher bitrate) reduces deblock intensity.

### Coding Tree Unit (CTU)

`--ctu`: Sets maximum CTU size (`x265`). While `64` is allowed, it increases smearing and computational load for &le; 1080p, as well as reduce the effect of multi-threading optimizations, so `32` is recommended.

> H.265 divides the picture into CTUs (Coding Tree Unit). In H.265 standard, if something is called xxxUnit, it indicates a coding logical unit which is in turn encoded into an H.265 bit stream. On the other hand, if something is called xxxBlock, it indicates a portion of video frame buffer where a process is target to. Coding Tree Unit is therefore a logical unit. It usually consists of three blocks, namely luma (Y) and two chroma samples (Cb and Cr), and associated syntax elements. Each block is called CTB (Coding Tree Block). CTB can be split into CBs.[^1]

`--qg-size`: Quantization Group size. Specifies the minimum Coding Unit (CU) size at which QP can be adjusted. Lower values increase QP flexibility within a frame; `8` is recommended.

> A coding tree unit can be divided into coding units. CU consists of three CBs (Y, Cb, and Cr) and associated syntax elements.[^1]

### Chroma Adjustments

`--cbqpoffs`, `--crqpoffs`: Offsets for chroma planes (Cb, Cr). H.264 auto-adjusts chroma bitrate via psycho-visual optimization; H.265 lacks this, so `-2` offsets help prevent chroma texture loss.

### Sample Adaptive Offset

`--no-sao`: Disables Sample Adaptive Offset (SAO), which reduces DCT ringing artifacts[^2] but causes aggressive smearing. Disable unless encoding at very low bitrates.

### Motion Estimation (ME)


ME settings (`--me`, `--subme`, `--merange`) trade encoding time for efficiency. Use stronger Frame settings (`--ref`, `--bframes`) for low-motion anime, stronger ME for high-motion content.
- `x264` examples:
  - Fast: `--me umh --subme 7 --merange 16`
  - Medium: `--me umh --subme 10 --merange 24`
  - Slow: `--me tesa --subme 10 --merange 24`

`--me`: Motion search algorithm:
- `dia` (`x265`: `0`): Diamond search, not recommended.
- `hex` (`x265`: `1`): Hexagonal search, default, fast but basic.
- `umh` (`x265`: `2`): Multi-hexagonal search, balanced quality/speed, recommended.
- `esa` (`x265`: `4`): Exhaustive search, very slow.
- `tesa` (`x264` only): Transformed exhaustive search, slightly slower but better than `esa`.
  > `tesa` vs. `umh`: 5–10% quality gain, 150–200% time increase.
- `x265` extras: `star` (`3`, recommended over `umh`), `full` (`5`, too slow, not optimized)[^3].

`--subme`: Subpixel refinement (`0`–`11`, higher = better quality, slower). Recommended: `7` (speed), `10` (quality), minimum `3` (`slow` preset default).

`--merange`: Motion search range. Recommended: `16`–`24` (720p), `24`–`38` (1080p). Larger values slow encoding.

### Block Partitioning

`--no-rect`, `--no-amp`: Disable H.265’s rectangular (1x2/2x1) or asymmetric (1x4/3x4/4x1/4x3) blocks. For &le; 1080p, these add little benefit but increase encoding time. Disable `amp` at least; use `--limit-tu 4` to limit inefficient splits if leave `rect` enabled.

### Reference Frames

`--ref`: Number of reference frames a frame can use. Linear time impact, diminishing quality gains. Also effects decode speed.
- Speed: `ref=4`.
- General anime: `ref=6` (2–4% size savings vs. `ref=4`).
- High compression: `ref=8` (4–8% savings).
- Extreme compression: `ref=13` (6–15% savings).

> Static or highly dynamic scenes benefit less from high ref. VCB-Studio suggests `ref≤6` for H.265 (typically `4`).

`--scenecut` (`x265`), `--scene-cut` (`x264`): Sensitivity for inserting extra I-frames at scene changes (default `40`). Lower values increase I-frame insertion.

`--keyint`: Maximum GOP size (distance between IDR frames). Larger values increase encoder flexibility but slow seeking. Recommended: `360`–`480` (online), `480`–`720` (local).

`--min-keyint`: Minimum GOP size. Set to `1` to make all I-frames IDR frames, ensuring Blu-ray compatibility and simpler seeking.

### B-Frames

`--open-gop`, `--no-open-gop`: Enables B-frames in one GOP to reference frames in the next. Improves efficiency in specific scenes but may cause playback issues. Generally safe either way.

`--weightb`: Enables weighted prediction for B-frames, useful for fades. Always enable (default).

`--bframes`: Maximum consecutive B-frames. Higher values slightly increase encoding time and compression. Recommended: `3`–`8` (live-action), `6`–`12` (anime).

### Rate Control

`--aq-mode`: Adaptive Quantization (AQ) prevents excessive bitrate reduction in flat/texture areas.
- `x264`: `0` (disable), `1` (variance, safe), `2` (auto-variance, efficient but riskier).
- `x265`:
  - 8-bit: `1` (stable, suitable for high-bitrate), `2` (efficient, mid/low-bitrate), `3` (dark scene enhancement).
  - 10-bit: `1` (CRF ≤ `16`), `2` (higher CRF).

  > File size `3`>`1`>`2`.

`--aq-strength`: AQ intensity. Higher for high-quality encoding.
- `x264`: `0.6–1.0` (anime), `0.8–1.2` (live-action).
- `x265`: `0.8` (`aq-mode=1`), `0.9` (`aq-mode=2`), `0.7` (`aq-mode=3`).

`--qcomp`: Quantizer Compression, controls QP temporal variation (`0` = constant bitrate, `1` = constant QP). Recommended: `0.65` (slightly above default `0.6`) for mid/high-quality encoding.

`--mbtree`, `--no-mbtree`: Macroblock-Tree enhances rate control by prioritizing frequently referenced blocks. Benefits mid/low-bitrate encoding (CRF > `18`), but smears flats/textures at high bitrates (CRF < `16`). VCB-Studio uses:
  - `crf=16.0`, `mbtree=1`, `qcomp=0.80`; `crf=17.0`, `mbtree=0`, `qcomp=0.70`;
  - `crf=16.5`, `mbtree=1`, `qcomp=0.75`; `crf=17.5`, `mbtree=0`, `qcomp=0.60`.
  - `crf=17.0`, `mbtree=1`, `qcomp=0.75`; `crf=18.0`, `mbtree=0`, `qcomp=0.60`;
  - `crf=19.0`, `mbtree=1`, `qcomp=0.70` (It's not advisable to disable MB-tree when CRF &ge; `19`)

  > MB-Tree greatly reduce the file size, it's benefit to lower CRF by `1` if MB-tree is enabled. MB-Tree also amplifies the effect of `qcomp`, so increase `qcomp` to lower the variation of QP.

`--pbratio`: Reduces quality gap between P- and B-frames. Lower values benefit anime, which has many B-frames.

### Psycho-Visual Optimization

`--psy-rd` (`x264`): Enhances subjective quality by preserving textures over blurring. Two parameters:
1. Psy-rd Strength: `0.4`–`1.0` (anime), `0.7`–`1.3` (live-action). Higher for high-quality encoding.
2. Psy Trellis: `0.1` with `mbtree`; `0` without.
3. Recommended: `0.6:0.15`.


- `--psy-rd` (`x265`): Controls sharpness/detail. Default `2.0` is balanced; reduce to `1.5` for mid/low-bitrate.
- `--psy-rdoq` (`x265`): Similar to H.264’s Psy Trellis, default `0.0`. Set to `1.0` for better detail/noise retention.

### Mode Decision/Analysis

`--rd`: Rate-Distortion Optimization level (higher = more complex). `3` is balanced; `5` is effectively the maximum (per documentation, `3`=`4`, `5`=`6`).

`--rdoq-level` (`x265`): Rate-distortion analysis on quantization[^3]:
- `0`: No rate-distortion cost.
- `1`: Optimizes rounding, enables `psy-rdoq`.
- `2`: Includes decimation decisions, less effective for `psy-rdoq`.

>  Default: `0` in `medium` preset); enabled in `slow`+.

`--b-intra`: Allows Intra Blocks in B-frames, recommended for anime.

`--rc-lookahead`: Frames to look ahead for CU-Tree planning (CU-Tree is H.265’s MB-Tree equivalent). Higher for high-framerate sources. Recommended: `60`–`80`.

`--strong-intra-smoothing`, `--no-strong-intra-smoothing`: Enables bilinear interpolation for 32x32 intra blocks to reduce blocking/banding. Default enabled.

### Additional Concepts

#### I, P, B Frames

- I-Frame (Independent): Encoded independently, like a JPEG, typically at scene starts.
- P-Frame (Predictive): References prior I/P-frames, reducing size for low-motion scenes.
- B-Frame (Bi-directional): References prior and future frames, efficient for static/regular scenes.

Typical sequence: `IPBBPBPIPPB...`. Videos always start with an I-frame.

#### IDR Frames and GOP

- IDR Frame (Instantaneous Decoder Refresh): A special I-frame that resets the decoder, preventing subsequent frames from referencing anything before it. In closed GOP (`--no-open-gop`), prior frames cannot reference post-IDR frames.
- GOP (Group of Pictures): From one IDR to just before the next. Closed GOPs are independent, decodable segments.
- Seeking Behavior:
  - Playback seeks the nearest prior IDR frame (M) for a target frame (N).
  - Fast seeking: Starts at M (may jump back slightly).
  - Precise seeking: Decodes from M to N, which can lag with large GOPs.
  - `--min-keyint 1` makes all I-frames IDR, improving seeking and Blu-ray compatibility. `--keyint` sets max GOP size.

## References

[^1]: ["HEVC – What are CTU, CU, CTB, CB, PB, and TB?"](https://codesequoia.wordpress.com/2012/10/28/hevc-ctu-cu-ctb-cb-pb-and-tb/). *codesequoia.wordpress.com*. Retrieved 2022-2-10.
[^2]: Yu Yuan, David Feng, and Yu-Zhuo Zhong. ["The Causation and Solution of Ringing Effect in DCT-based Video Coding"](https://publications.waset.org/3309/pdf). *World Academy of Science, Engineering and Technology, International Journal of Computer, Electrical, Automation, Control and Information Engineering*, vol. 2, no. 1, pp. 231-236, 2008
[^3]: ["Command Line Options - x265 documentation"](https://x265.readthedocs.io/en/stable/cli.html). *x265.readthedocs.io*. Retrieved 2022-2-10.
[^4]: ["VCB-Studio 教程 10 x265 v2.9 参数设置"](https://vcb-s.nmm-hd.org/Dark%20Shrine/%5BVCB-Studio%5D%5B%E6%95%99%E7%A8%8B10%5Dx265%202.9%E5%8F%82%E6%95%B0%E8%AE%BE%E7%BD%AE/%5BVCB-Studio%5D%5B%E6%95%99%E7%A8%8B10%5Dx265%202.9%E5%8F%82%E6%95%B0%E8%AE%BE%E7%BD%AE.pdf). *vcb-s.nmm-hd.org*. Retrieved 2022-2-10.
[^5]: ["VCB-Studio 教程 09 x264 参数设置"](https://vcb-s.nmm-hd.org/Dark%20Shrine/%5BVCB-Studio%5D%5B%E6%95%99%E7%A8%8B09%5Dx264%E5%8F%82%E6%95%B0%E8%AE%BE%E7%BD%AE/%5BVCB-Studio%5D%5B%E6%95%99%E7%A8%8B09%5Dx264%E5%8F%82%E6%95%B0%E8%AE%BE%E7%BD%AE.pdf). *vcb-s.nmm-hd.org*. Retrieved 2022-2-10.

