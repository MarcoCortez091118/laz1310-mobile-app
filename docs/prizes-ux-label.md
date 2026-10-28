# Premios: cambio de etiqueta visual (Issue #77)

La sección pública de LA Z 1310 se presenta como **Premios** en español y
**Prizes** en inglés. Se actualizaron Home, Explorar, listado, detalle,
participación, historial, confirmación, preferencias y accesibilidad.

## Compatibilidad
Se conservaron los identificadores internos `dynamics`, las rutas de
Expo Router `/dynamics/*`, los modelos, contratos FastAPI
`/api/v1/dynamics/*`, Firebase Auth/App Check, participaciones existentes,
preferencias de notificaciones, releases y reglas de publicación.
No requiere migración de datos ni cambio del backend.

## Pruebas
`npm run check:prizes-label` valida etiquetas ES/EN, destinos y ausencia de
nombres antiguos en las vistas públicas afectadas. En QA validar también
premios activos/vacíos, detalle, formulario y confirmación, invitado/autenticado,
retroceso e historial. No fusionar el PR sin revisión humana.
