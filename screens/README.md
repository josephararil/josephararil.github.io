# App screenshots

Drop a screenshot here for any app and it will fade in over the gradient
artwork on its card and in its detail modal.

**Naming:** use the exact repo name, e.g.

```
screens/fire-buckets.png      → Compass
screens/storybook.png         → Storybook
screens/sophie-roadmap.png    → Sophie's Roadmap
screens/tennis.png            → Tennis CRM
screens/about.png             → About Joseph
```

**Recommended size:** ~1600×1000 (16:10), PNG or JPG. The card crops to a
16:10 area and the modal to a wide band, both `object-fit: cover`, so center
the most recognizable part of the UI.

If a file is missing, the app simply shows its gradient + glyph tile — no
broken images. So you can add screenshots gradually.

To point an app at a differently-named file, set its `shot:` field in `app.js`.
