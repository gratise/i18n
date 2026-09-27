# Introduction

`@gratise/i18n` provides one translator instance for React and non-React code. Source text is the default key, with an optional stable `id`. JSON catalogs are plain files that teams can edit by hand.

```tsx
<T>Hello, world!</T>
<T id="nav.settings">Settings</T>
```

ICU MessageFormat is used for interpolation, plural forms, and selection. The default message is shown when no catalog entry exists.
