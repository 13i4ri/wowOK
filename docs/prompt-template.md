# Style Lock Prompt Template

Use this exact template for each image generation request so character/style continuity stays consistent.

## Fixed Style Block

```text
Create a 16:9 illustration (1600x900) in a notebook-sketch cinematic style.
Main character: one stick-man protagonist with consistent proportions and face style in every scene.
Line style: clean hand-drawn ink lines, subtle paper grain, warm off-white paper background.
Color style: soft earthy accents only, no neon tones, romantic gentle atmosphere.
Composition: centered subject with clear foreground/background separation.
Lighting: soft daylight, natural shadows, no harsh contrast.
Output constraints: no UI text, no watermarks, no logos, no extra characters unless requested.
```

## Per-Scene Block

```text
Scene action: <what is happening right now>
Camera framing: <wide / medium / close-up>
Emotion: <exact emotional tone>
Continuity constraints: Keep the same stick-man design, line thickness, and notebook style from previous scene.
```
