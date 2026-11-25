# MOVEMINT — Relocation & Moving Cost Estimator (Static Demo)

**MOVEMINT** is a fictional professional relocation and moving brand built strictly with **HTML5**, **CSS3**, and **Vanilla JavaScript** — zero frameworks, zero Node.js, zero backend, and zero database.

> **Illustrative Demo Notice:** MOVEMINT is a fictional concept website. All moving estimates, reviews, and enquiry previews are strictly illustrative and simulated locally in your browser. No real moving service can be booked, and no payment integration exists.

---

## Design & UX Highlights

- **Brand Palette:** Warm cream (`#FAF6EE`, `#F1E9DA`), deep charcoal (`#1A1B18`), and energetic lime green (`#B9F527`).
- **Bold Typography & Asymmetric Layouts:** `Syne` display headlines paired with `Plus Jakarta Sans` UI copy and `JetBrains Mono` for transparent price calculations.
- **Custom Vector Illustrations:** Hand-crafted SVG artwork for the hero moving-box scene, logo mark, services cards, process steps, and furniture items.
- **Accessible & Responsive:** Semantic landmarks, skip link, keyboard-navigable accordion (`ArrowUp` / `ArrowDown` / `Home` / `End`), `aria-live` total updates, inline form validation (`aria-invalid` + `role="alert"`), `prefers-reduced-motion` support, and a print-ready summary view.

---

## Interactive Moving Cost Estimator

The 5-step wizard updates a sticky itemized receipt in real time on every selection or quantity change:

1. **Step 1 — Current Home Type:** Studio (`$180`), 1 Bedroom (`$260`), 2 Bedrooms (`$380`), 3 Bedrooms (`$520`), Large House (`$740`)
2. **Step 2 — Moving Distance:** Under 5 km (`$45`), 5–15 km (`$95`), 15–30 km (`$165`), Above 30 km (`$260`)
3. **Step 3 — Select Items (with `−` / `+` & numeric controls):**
   - Sofa (`$35`), Bed (`$40`), Wardrobe (`$45`), Refrigerator (`$50`), Washing machine (`$40`), Dining table (`$35`), Boxes (`$4`)
   - Includes quick helpers to **Auto-fill typical items** for the selected home size or **Reset to 0**.
4. **Step 4 — Extra Services:** Packing assistance (`+$110`), Furniture dismantling (`+$85`), Fragile item handling (`+$65`), Unpacking assistance (`+$95`)
5. **Step 5 — Moving Date & Contact Details:** Client-side validated form leading to an illustrative **Move Snapshot Summary Screen** with Edit, Print/Save PDF, and Reset actions.

### Transparent Illustrative Formula

```text
Illustrative Total = Home Base Fee + Distance Fee + Σ(Item Qty × Unit Rate) + Σ(Extra Services)
```

---

## Project Structure

```text
├── index.html                           # Semantic HTML5 structure & all 9 website sections
├── style.css                            # Design tokens, asymmetric layouts, components & print CSS
├── script.js                            # Pure calculation engine, multi-step wizard, FAQ & validation
├── run_server.ps1                       # Optional local PowerShell static HTTP preview server
├── README.md                            # Project documentation
└── assets/
    ├── icons/
    │   └── movemint-mark.svg            # Brand logo mark & favicon
    └── illustrations/
        ├── hero-boxes.svg               # Custom hero stacked moving-box illustration
        ├── service-home.svg             # Home relocation illustration
        ├── service-office.svg           # Office relocation illustration
        └── service-packing.svg          # Packing & furniture handling illustration
```

---

## How to Run Locally

1. **Direct file preview:** Open `index.html` directly in any modern browser.
2. **Local HTTP preview (Windows PowerShell):**
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\run_server.ps1
   ```
   Then visit `http://localhost:8080/`.
