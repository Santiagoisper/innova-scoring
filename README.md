# Innova Trials - Scoring System v2.0

Este repositorio contiene la arquitectura de referencia y la lógica de scoring optimizada para **Innova Trials**.

## 🚀 Mejoras Implementadas

### 1. Motor de Scoring Inteligente (`shared/scoring.ts`)
Hemos evolucionado el sistema de "hacha binaria" a un modelo de decisión con matices:
- **Umbral de Knockout (40 pts):** Los criterios críticos ahora tienen un umbral de seguridad de 40 puntos.
- **Zona de Revisión Manual (30-40 pts):** Si un centro cae en este rango en un punto crítico, el sistema lo marca como `requiresManualReview` y estado `conditional`, evitando el rechazo automático injusto.
- **Confidence Score:** Se calcula un score de confianza basado en la documentación entregada (0-100%) que es independiente del score de capacidad técnica.

### 2. Estructura de Proyecto
Sincronizado con la arquitectura de Replit:
- `client/`: Interfaz de usuario (React + Vite).
- `server/`: API y lógica de negocio (Express + Drizzle).
- `shared/`: Esquemas y lógica compartida (Scoring Engine).

## 🛠️ Cómo usar este código en Replit

Para actualizar tu proyecto actual sin errores:
1. Crea un **Nuevo Repl**.
2. Selecciona **"Import from GitHub"**.
3. Pega el link de este repositorio: `https://github.com/Santiagoisper/innova-scoring`
4. Replit configurará todo el entorno automáticamente.

---
*Desarrollado con rigor intelectual para Innova Trials.*
