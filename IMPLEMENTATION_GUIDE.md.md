# 🔧 GUÍA DE IMPLEMENTACIÓN - INNOVA SCORING
## Tareas Pendientes de Completar

**Fecha**: 8 de Febrero, 2026  
**Estado**: Parcialmente Completado

---

## ✅ COMPLETADO

### 1. Dashboard Metrics (Commit: bf40e9d)
- ✅ **Global Sites**: Ahora muestra centros evaluados, aprobados (green) Y con link enviado
- ✅ **Approved Sites**: Solo cuenta sitios con `score_level='green'`  
- ✅ **Average Quality**: Promedio dinámico de TODOS los sitios evaluados

### 2. Token Generation API (Commit: ec73821)
- ✅ **Email Sending**: Preparado con plantilla HTML (integrar con Resend)
- ✅ **Update public_token**: Se actualiza automáticamente en la tabla centers
- ✅ **Validación mejorada**: Verifica centro existente antes de crear token

### 3. RUBRIC → CRITERIA (Commit: b7b9c38)
- ✅ Renombrado en `/app/admin/rubric/page.tsx`

### 4. CUMPLIMIENTO NORMATIVA
- ✅ Script SQL preparado: `/supabase/remove_criteria_2_3.sql`
- ⚠️ **ACCIÓN REQUERIDA**: Ejecutar este script en Supabase SQL Editor

---

## 🔄 PENDIENTE DE IMPLEMENTACIÓN

### 5. Hacer Conteo de Criterios Dinámico

**Ubicación**: `app/page.tsx` líneas 72-75

**Problema Actual**:
```typescript
{ label: 'Criteria Evaluated', value: '18' },
{ label: 'Categories', value: '5' },
{ label: 'Maturity Levels', value: '5' },
{ label: 'Weighted Scoring', value: '100%' },
```

**Solución Propuesta**:
```typescript
// Agregar al inicio del componente LandingPage
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function LandingPage() {
  const [criteriaCount, setCriteriaCount] = useState(18)
  const [categoriesCount, setCategoriesCount] = useState(5)
  
  useEffect(() => {
    async function loadMetrics() {
      const supabase = supabaseBrowser()
      
      // Contar criterios activos
      const { count: criteria } = await supabase
        .from('criteria')
        .select('*', { count: 'exact', head: true })
      
      // Contar categorías únicas
      const { data: categories } = await supabase
        .from('criteria')
        .select('category')
      
      const uniqueCategories = new Set(categories?.map(c => c.category)).size
      
      if (criteria) setCriteriaCount(criteria)
      if (uniqueCategories) setCategoriesCount(uniqueCategories)
    }
    
    loadMetrics()
  }, [])
  
  // Actualizar el array de stats:
  const stats = [
    { label: 'Criteria Evaluated', value: String(criteriaCount) },
    { label: 'Categories', value: String(categoriesCount) },
    { label: 'Maturity Levels', value: '5' },
    { label: 'Weighted Scoring', value: '100%' },
  ]
  
  return (
    // ... resto del código usando stats.map() en línea 76
  )
}
```

---

### 6. Activity LOG - Agregar Nombres de Admin y Evaluadores

**Ubicación**: `lib/activity-log.ts`

**Cambios Necesarios**:

1. **Modificar función `logActivity`**:
```typescript
export async function logActivity(
  action: string,
  centerId?: string,
  centerName?: string,
  details?: any,
  userId?: string,  // ← NUEVO
  userName?: string  // ← NUEVO
) {
  const supabase = createClient()
  
  await supabase.from('activity_log').insert([{
    action,
    center_id: centerId,
    center_name: centerName,
    user_id: userId,      // ← NUEVO
    user_name: userName,  // ← NUEVO
    details,
    timestamp: new Date().toISOString()
  }])
}
```

2. **Actualizar tabla en Supabase**:
```sql
ALTER TABLE activity_log 
ADD COLUMN user_id UUID REFERENCES auth.users(id),
ADD COLUMN user_name TEXT;
```

3. **Actualizar llamadas en el código**:
```typescript
// En app/api/admin/create-evaluation-link/route.ts
const session = await supabase.auth.getSession()
const user = session.data.session?.user

await logActivity(
  'TOKEN_GENERATED',
  center_id,
  center.name,
  { token, link },
  user?.id,
  user?.email
)
```

---

### 7. Eliminar Botones Duplicados en Landing Page

**Ubicación**: `app/page.tsx` header

**Acción**: Revisar líneas 20-65 y eliminar botones duplicados:
- Verificar que solo haya UN botón "Client Portal"  
- Verificar que solo haya UN botón "Admin Access"
- Mantener versión mobile-responsive

---

### 8. Fusionar Maturity Level y Weight en UI

**Ubicación**: Formularios de evaluación (ClientEvaluation.tsx)

**Cambio Visual Propuesto**:
```typescript
// En lugar de tener dos secciones separadas:
// - Maturity Level
// - Weight: 100%

// Fusionar en una sola tarjeta:
<div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
  <h3 className="text-lg font-bold text-blue-900 mb-3">
    Maturity Assessment & Scoring
  </h3>
  
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Maturity Level</p>
      <p className="text-2xl font-black text-blue-600">{maturityLevel}</p>
    </div>
    
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Weight</p>
      <p className="text-2xl font-black text-blue-600">100%</p>
    </div>
  </div>
  
  <p className="text-sm text-slate-600 mt-4 leading-relaxed">
    Este criterio evalúa el nivel de madurez del centro en esta categoría.
    Todos los criterios tienen el mismo peso (100%) en la puntuación final
    para garantizar una evaluación equilibrada.
  </p>
</div>
```

---

## 📋 VALIDACIONES ADICIONALES

### Prevenir Inconsistencias de Datos

**En `/app/api/admin/create-evaluation-link/route.ts`**:

Agregar validación antes de crear token:
```typescript
// Verificar que no haya evaluaciones pendientes con 100 puntos
const { data: pendingWithScore } = await supabase
  .from('evaluations')
  .select('*')
  .eq('center_id', center_id)
  .eq('status', 'pending')
  .gte('total_score', 100)
  .single()

if (pendingWithScore) {
  return NextResponse.json(
    { 
      error: 'Centro tiene evaluación pendiente con puntaje completo. Por favor revise.',
      evaluation_id: pendingWithScore.id 
    },
    { status: 400 }
  )
}

// Verificar que sitios aprobados no tengan link pendiente
const { data: approvedPending } = await supabase
  .from('evaluations')
  .select('*')
  .eq('center_id', center_id)
  .eq('score_level', 'green')
  .eq('status', 'pending')
  .single()

if (approvedPending) {
  // Actualizar automáticamente a completed
  await supabase
    .from('evaluations')
    .update({ status: 'completed' })
    .eq('id', approvedPending.id)
}
```

---

## 🚀 PASOS DE IMPLEMENTACIÓN

### Paso 1: Ejecutar Script SQL (CRÍTICO)
```bash
# Ir a Supabase Dashboard → SQL Editor
# Ejecutar: supabase/remove_criteria_2_3.sql
```

### Paso 2: Implementar Criterios Dinámicos
```bash
# Editar app/page.tsx según sección 5
git add app/page.tsx
git commit -m "feat: make criteria count dynamic on landing page"
git push origin main
```

### Paso 3: Mejorar Activity Log
```bash
# 1. Ejecutar ALTER TABLE en Supabase
# 2. Actualizar lib/activity-log.ts
# 3. Actualizar todas las llamadas a logActivity()
git add lib/activity-log.ts app/api/**/*
git commit -m "feat: add user names to activity log"
git push origin main
```

### Paso 4: Limpiar Landing Page
```bash
# Editar app/page.tsx y eliminar duplicados
git add app/page.tsx
git commit -m "fix: remove duplicate buttons in landing page header"
git push origin main
```

### Paso 5: Fusionar UI Sections
```bash
# Editar app/cliente/[token]/ClientEvaluation.tsx
git add app/cliente/**/*
git commit -m "ui: merge maturity level and weight sections"
git push origin main
```

### Paso 6: Agregar Validaciones
```bash
# Editar app/api/admin/create-evaluation-link/route.ts
git add app/api/**/*
git commit -m "feat: add validation to prevent data inconsistencies"
git push origin main
```

---

## 📧 INTEGRACIÓN EMAIL (OPCIONAL)

### Configurar Resend

1. **Instalar Resend**:
```bash
npm install resend
```

2. **Agregar API Key** en `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

3. **Descomentar código** en `app/api/admin/create-evaluation-link/route.ts` líneas 15-39

4. **Importar Resend**:
```typescript
import { Resend } from 'resend'
```

---

## ✅ CHECKLIST FINAL

- [ ] Ejecutar script SQL remove_criteria_2_3.sql
- [ ] Hacer criterios dinámicos en landing page  
- [ ] Agregar user names a activity log
- [ ] Eliminar botones duplicados
- [ ] Fusionar Maturity/Weight UI
- [ ] Agregar validaciones API
- [ ] (Opcional) Integrar Resend para emails
- [ ] Verificar en Vercel que todo compile
- [ ] Probar flujo completo end-to-end

---

## 🎯 PRIORIDAD

1. 🔴 **ALTA**: SQL script (remove_criteria)
2. 🔴 **ALTA**: Validaciones API  
3. 🟡 **MEDIA**: Criterios dinámicos
4. 🟡 **MEDIA**: Activity log names
5. 🟢 **BAJA**: UI improvements (duplicates, merge)

---

**Autor**: AI Assistant  
**Última Actualización**: 2026-02-08
