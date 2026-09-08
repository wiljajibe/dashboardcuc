# Semestres de matrículas

- `index.html`: 2026-2, conservado.
- `2027-1.html`: 2027-1. Sin cifras hasta recibir su primer corte y sus metas.
- Ambas páginas usan los permisos existentes del dashboard `matriculas` y filtran `payload.metadata.period` antes de seleccionar el último corte activo.
- Los archivos fuente y Excel permanecen privados; solo los datos consolidados se publican en Supabase.

## Publicación de cortes

Validar el periodo en la fuente y en `payload.metadata.period`. Usar una transacción para desactivar el corte anterior y agregar el nuevo. La desactivación debe limitarse **al dashboard y al periodo que se está actualizando**:

```sql
update public.dashboard_datasets
set active = false
where dashboard_id = :dashboard_id
  and payload->'metadata'->>'period' = :period
  and active = true;
```

No desactivar todos los cortes del dashboard: eso dejaría el otro semestre sin información visible. Conservar los registros históricos y las copias locales. No reutilizar metas ni matrícula académica de 2026-2 como cifras de 2027-1. La ausencia de cortes se muestra como pendiente, no como cero estudiantes.
