# Mentor assets

Cada mentor tem uma pasta nomeada pelo seu **slug** (ex.: `luiza-trajano/`)
contendo dois arquivos de imagem:

- `profile.webp` — quadrada, **1024×1024 px**, ~80–150 KB.
  Usada em avatares, listagens, header de perfil.
- `work.webp` — landscape, **1600×900 px**, ~200–400 KB.
  Usada em hero, cards grandes, telas que mostram o trabalho do mentor.

## Convenções

- Formato: **WebP** (qualidade ~80) para equilíbrio qualidade/peso.
  AVIF também funciona se você quiser ainda mais compressão.
- Cor de fundo neutra ou alinhada à categoria.
- Nada de URL na planilha: o código resolve o path via slug:

  ```ts
  const profileSrc = `/mentors/${mentor.slug}/profile.webp`;
  const workSrc    = `/mentors/${mentor.slug}/work.webp`;
  ```

- Se for usar Next.js, esses arquivos ficam em `/public/mentors/{slug}/`
  e podem ser servidos via `<Image src={profileSrc} ... />`.

Enquanto não tem foto real, deixa o `.gitkeep` na pasta para o git
preservar a estrutura.
