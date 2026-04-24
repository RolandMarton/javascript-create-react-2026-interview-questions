const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, LevelFormat, BorderStyle, WidthType,
  Table, TableRow, TableCell, ShadingType, PageNumber,
  VerticalAlign, PageBreak
} = require('docx');
const fs = require('fs');
const path = require('path');

// ── colour palette ──────────────────────────────────────
const BRAND   = "1565C0";  // deep blue
const ACCENT  = "0288D1";  // mid blue
const LIGHT   = "E3F2FD";  // very light blue
const MID     = "BBDEFB";  // medium light blue
const DARK    = "0D47A1";  // darkest blue for headings
const WHITE   = "FFFFFF";
const GRAY    = "546E7A";

// ── helpers ─────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 36, color: DARK, font: "Arial" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, color: BRAND, font: "Arial" })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: ACCENT, font: "Arial" })]
  });
}

function body(text) {
  return new Paragraph({
    spacing: { before: 60, after: 100 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: "212121" })]
  });
}

function bullet(text, bold_prefix) {
  const children = bold_prefix
    ? [new TextRun({ text: bold_prefix, bold: true, size: 22, font: "Arial", color: "212121" }),
       new TextRun({ text, size: 22, font: "Arial", color: "212121" })]
    : [new TextRun({ text, size: 22, font: "Arial", color: "212121" })];
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 60 },
    children
  });
}

function note(text) {
  return new Paragraph({
    spacing: { before: 80, after: 100 },
    indent: { left: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 8 } },
    children: [new TextRun({ text, italics: true, size: 20, font: "Arial", color: GRAY })]
  });
}

function code(text) {
  return new Paragraph({
    spacing: { before: 60, after: 80 },
    indent: { left: 360, right: 360 },
    shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "C62828" })]
  });
}

function space() {
  return new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun("")] });
}

function divider() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "BDBDBD", space: 2 } },
    children: [new TextRun("")]
  });
}

function checklistItem(num, topic, desc) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { before: 60, after: 80 },
    children: [
      new TextRun({ text: topic + " — ", bold: true, size: 22, font: "Arial", color: BRAND }),
      new TextRun({ text: desc, size: 22, font: "Arial", color: "212121" })
    ]
  });
}

function twoColTable(rows) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "BDBDBD" };
  const borders = { top: border, bottom: border, left: border, right: border };

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: rows.map((row, i) => new TableRow({
      children: row.map(cell => new TableCell({
        borders,
        width: { size: 4680, type: WidthType.DXA },
        shading: { fill: i === 0 ? MID : (i % 2 === 0 ? LIGHT : WHITE), type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({
            text: cell,
            bold: i === 0,
            size: i === 0 ? 22 : 20,
            font: "Arial",
            color: i === 0 ? DARK : "212121"
          })]
        })]
      }))
    }))
  });
}

// ── DOCUMENT ────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 600, hanging: 300 } } }
        }]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 600, hanging: 300 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: BRAND },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: ACCENT },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 }
      }
    },
    children: [

      // ═══════════════════════════════════════════
      // COVER
      // ═══════════════════════════════════════════
      new Paragraph({
        spacing: { before: 1440, after: 240 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "React Frontend", bold: true, size: 72, color: DARK, font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 240 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Complete Reference Guide", bold: true, size: 52, color: BRAND, font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 1440 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "2026 Edition", size: 36, color: GRAY, font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 200 },
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: BRAND, space: 4 } },
        children: [new TextRun({ text: "25 Core Frontend Concepts  •  React Hooks Deep-Dive  •  Architecture  •  Performance  •  Testing", size: 20, color: GRAY, font: "Arial" })]
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════════
      // SECTION 0 — CHECKLIST OVERVIEW
      // ═══════════════════════════════════════════
      h1("Frontend Concepts Checklist — Quick Reference"),
      body("The following 25 concepts form the core of modern React frontend engineering. Each is covered in depth throughout this guide."),
      space(),

      checklistItem(1,  "Pagination",                   "Splitting data into discrete pages for display. Covered in UX & Performance section."),
      checklistItem(2,  "Infinite Scroll",               "Progressively loading data as the user scrolls. Contrast with pagination."),
      checklistItem(3,  "Debouncing",                    "Delaying rapid function calls until a pause — essential for search inputs and resize events."),
      checklistItem(4,  "WebSocket",                     "Full-duplex real-time communication protocol — chat, live data, collaborative tools."),
      checklistItem(5,  "REST vs GraphQL",               "Two philosophies for API design: resource-oriented endpoints vs. flexible query language."),
      checklistItem(6,  "Local Storage vs Cookies",      "Two browser storage mechanisms with distinct security profiles and use cases."),
      checklistItem(7,  "Authentication vs Authorization","AuthN proves identity; AuthZ controls what an authenticated user may do."),
      checklistItem(8,  "Redux",                         "Centralised, predictable state management with actions, reducers, and a single store."),
      checklistItem(9,  "Lazy Loading",                  "Loading modules or assets only when they are needed, reducing initial bundle size."),
      checklistItem(10, "Code Splitting",                "Breaking bundles into smaller chunks loaded on demand — React.lazy, dynamic import()."),
      checklistItem(11, "Bundle Size Optimization",      "Minimising JavaScript payload via tree-shaking, minification, and dependency auditing."),
      checklistItem(12, "Tree Shaking",                  "Eliminating dead code at build time by analysing static ES module imports."),
      checklistItem(13, "Memoization",                   "Caching computed values (useMemo) or function references (useCallback) to prevent redundant work."),
      checklistItem(14, "Caching",                       "Storing data client-side (React Query, SWR) or server-side (CDN, HTTP headers) for speed."),
      checklistItem(15, "CSR vs SSR vs SSG vs ISR",      "Four rendering strategies with different trade-offs for performance and SEO."),
      checklistItem(16, "Core Web Vitals",               "Google's LCP, INP, and CLS metrics that directly affect ranking and UX scores."),
      checklistItem(17, "Cross-Browser Compatibility",   "Ensuring consistent behaviour across Chrome, Firefox, Safari, Edge via polyfills and testing."),
      checklistItem(18, "Optimistic UI Updates",         "Applying state changes immediately in the UI before the server confirms, then reconciling."),
      checklistItem(19, "Suspense",                      "React mechanism for declarative loading states — pairs with lazy() and data-fetching."),
      checklistItem(20, "Image Optimization",            "Serving modern formats (WebP, AVIF), responsive sizes, and lazy-loaded images."),
      checklistItem(21, "Accessibility (a11y)",          "WCAG compliance, semantic HTML, ARIA attributes — ensuring usability for all people."),
      checklistItem(22, "Webpack",                       "Module bundler powering most React build pipelines via loaders, plugins, and tree-shaking."),
      checklistItem(23, "Micro-frontend Architecture",   "Splitting a large frontend into independently deployable units owned by separate teams."),
      checklistItem(24, "Testing — RTL, Jest, Playwright","Unit (Jest), integration (React Testing Library), and E2E (Playwright) testing layers."),
      checklistItem(25, "Polyfills & Babel",             "Transpiling modern JS for older browsers and patching missing browser APIs at runtime."),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════════
      // SECTION 1 — REACT FUNDAMENTALS
      // ═══════════════════════════════════════════
      h1("1. React Fundamentals"),

      h2("1.1 Core Concepts"),
      body("React is a declarative JavaScript library for building user interfaces. It revolves around five pillars:"),
      bullet("Components — the reusable building blocks (function or class). Function components are the modern standard."),
      bullet("State — mutable data owned by a component, managed with useState or useReducer. State changes trigger re-renders."),
      bullet("Props — immutable data passed from parent to child. Props flow downward; callbacks enable child-to-parent communication."),
      bullet("Virtual DOM — a lightweight in-memory representation of the real DOM. React diffs the old and new virtual trees on each render and commits only the minimal set of DOM operations needed (reconciliation)."),
      bullet("Reconciliation — React's algorithm (Fiber) for comparing component trees and determining the minimal set of UI updates."),
      space(),

      h2("1.2 JSX"),
      body("JSX (JavaScript XML) is syntactic sugar that compiles to React.createElement() calls. It allows you to express UI structure alongside logic in a readable, HTML-like syntax."),
      bullet("JSX must return a single root element. Use <></> (fragment) to avoid adding unnecessary DOM nodes."),
      bullet("Expressions are embedded with {}. Conditionals use ternary or &&; loops use .map()."),
      bullet("className replaces class; htmlFor replaces for; camelCase is used for event handlers (onClick, onChange)."),
      bullet("Babel or a modern bundler transpiles JSX before it reaches the browser."),
      space(),

      h2("1.3 React Portals & Fragments"),
      body("Portals let you render a child component into a DOM node that lives outside the parent's hierarchy — ideal for modals, tooltips, and drawers that must escape overflow:hidden or z-index stacking contexts."),
      code("ReactDOM.createPortal(<Modal />, document.getElementById('portal-root'))"),
      body("Fragments group children without adding extra DOM nodes, keeping the DOM clean and avoiding CSS layout side-effects."),
      code("<>  <ChildA />  <ChildB />  </>"),
      space(),

      h2("1.4 React Suspense"),
      body("Suspense is React's declarative solution for handling asynchronous loading states. It pairs with React.lazy() for code-split components and with data-fetching libraries (React Query, Relay, use()) to show fallback UI while content loads."),
      bullet("Wrap lazy-loaded components or async-data consumers in <Suspense fallback={<Spinner />}>."),
      bullet("Nested Suspense boundaries allow granular loading skeletons — each boundary handles its own subtree independently."),
      bullet("React 18+ introduces concurrent rendering, which lets Suspense work smoothly with streaming SSR and transitions."),
      bullet("useTransition and startTransition prevent loading spinners from flashing during fast loads by marking updates as non-urgent."),
      note("Suspense for data fetching requires library support (React Query v5, Relay, SWR) or the experimental use() hook. Not every fetch() call triggers Suspense automatically."),
      space(),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════════
      // SECTION 2 — LIFECYCLE & HOOKS
      // ═══════════════════════════════════════════
      h1("2. Lifecycle Methods & Hooks"),

      h2("2.1 Class Component Lifecycle"),
      body("Class components expose lifecycle methods in three phases:"),
      bullet("Mounting: constructor() → render() → componentDidMount()"),
      bullet("Updating: shouldComponentUpdate() → render() → getSnapshotBeforeUpdate() → componentDidUpdate()"),
      bullet("Unmounting: componentWillUnmount()"),
      space(),

      h2("2.2 Functional Hooks Reference"),
      body("Hooks replace all class lifecycle methods and enable stateful logic in function components. The two rules: (1) only call hooks at the top level, (2) only call hooks inside React functions."),
      space(),

      h3("useState"),
      body("Declares a state variable and its setter. Setter calls schedule a re-render."),
      code("const [count, setCount] = useState(0);"),
      space(),

      h3("useEffect"),
      body("Runs side effects after render. Replaces componentDidMount, componentDidUpdate, and componentWillUnmount."),
      bullet("Empty dependency array [] → runs once on mount."),
      bullet("With dependencies [dep] → runs when dep changes."),
      bullet("Return a cleanup function for subscriptions, timers, event listeners."),
      code("useEffect(() => { fetchData(); }, [query]);"),
      space(),

      h3("useMemo & useCallback — Memoization"),
      body("useMemo caches the result of an expensive calculation. useCallback caches a function reference. Both accept a dependency array and only recompute when dependencies change."),
      bullet("useMemo — prevents recomputing expensive derived data on every render."),
      bullet("useCallback — prevents child components from re-rendering when a stable function reference is passed as a prop."),
      bullet("Only memoize when profiling reveals a genuine performance bottleneck — premature memoization adds complexity."),
      code("const sorted = useMemo(() => expensiveSort(data), [data]);"),
      code("const handler = useCallback(() => doThing(id), [id]);"),
      space(),

      h3("useReducer"),
      body("Manages complex state with a reducer function (state, action) => newState — similar to Redux but local. Prefer over useState when state transitions depend on multiple sub-values."),
      space(),

      h3("useRef"),
      body("Creates a mutable ref object whose .current property persists across renders without triggering re-renders. Used for DOM element access, storing previous values, and imperative APIs."),
      space(),

      h3("useContext"),
      body("Consumes a context value created by React.createContext(). Avoids prop drilling for globally relevant data like themes, auth state, or locale."),
      space(),

      h3("useParams (React Router)"),
      body("Extracts URL parameters from the current matched route. Returns a key-value object of dynamic segments."),
      code("const { id } = useParams(); // /users/:id"),
      space(),

      h2("2.3 Side Effects"),
      body("A side effect is any operation that reaches outside the component — data fetching, DOM mutation, subscriptions, timers, or global state updates."),
      bullet("Use useEffect to contain and clean up side effects predictably."),
      bullet("For async data, libraries like React Query or SWR are preferred — they add caching, deduplication, and background refetching."),
      bullet("Redux Thunk or Redux Saga handle async side effects in Redux-centric architectures."),
      bullet("Always return a cleanup function from useEffect when setting up subscriptions or timers."),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════════
      // SECTION 3 — STATE MANAGEMENT
      // ═══════════════════════════════════════════
      h1("3. State Management"),

      h2("3.1 Redux"),
      body("Redux is a predictable, centralised state management library. It follows three principles: single source of truth (one store), state is read-only (only actions mutate it), and changes are made with pure reducer functions."),
      space(),
      h3("Core concepts"),
      bullet("Store — the single object holding the entire application state, created with configureStore()."),
      bullet("Action — a plain object with a type field describing what happened. May carry a payload."),
      bullet("Reducer — a pure function (state, action) => newState that specifies how state changes."),
      bullet("Dispatch — the method used to send actions to the store."),
      bullet("Selector — a function that derives data from the store (useSelector hook in react-redux)."),
      space(),
      h3("Modern Redux Toolkit"),
      body("Redux Toolkit (RTK) is the official, opinionated way to write Redux. It eliminates boilerplate with createSlice, createAsyncThunk, and RTK Query for data fetching."),
      bullet("createSlice generates action creators and reducers from a single object."),
      bullet("RTK Query handles server-state: caching, invalidation, loading/error states — similar to React Query."),
      space(),
      h3("Best practices"),
      bullet("Keep state as flat and minimal as possible — only store shared, server-derived, or globally needed data."),
      bullet("Use selectors (reselect) to memoize derived data and avoid unnecessary re-renders."),
      bullet("Use middleware (Thunk/Saga) for async logic — never put side effects in reducers."),
      bullet("Enable Redux DevTools for time-travel debugging in development."),
      space(),

      h2("3.2 Context API vs Redux"),
      twoColTable([
        ["Context API", "Redux"],
        ["Built into React, zero dependencies", "External library (~2 kB with RTK)"],
        ["Simple: createContext + Provider + useContext", "More boilerplate; mitigated by Redux Toolkit"],
        ["Good for low-frequency updates (theme, auth)", "Good for high-frequency, complex state updates"],
        ["No middleware or dev tools out of the box", "Powerful middleware, DevTools, time-travel"],
        ["Every consumer re-renders on context change", "Fine-grained re-renders via selectors"],
        ["Best for smaller or medium apps", "Best for large, complex applications"],
      ]),
      space(),
      body("Both can coexist: use Context for theme/locale, Redux for business logic. Zustand, Jotai, and Recoil are lightweight alternatives worth evaluating."),
      space(),

      h2("3.3 React Query"),
      body("React Query (TanStack Query) is a server-state library. It treats data fetched from a server as a cache that needs synchronisation, not local UI state."),
      bullet("Automatic caching and background refetching — stale data is shown immediately while fresh data loads."),
      bullet("Deduplication — multiple components subscribing to the same query share one network request."),
      bullet("Pagination and infinite scroll helpers (useInfiniteQuery)."),
      bullet("Mutations with optimistic updates and automatic rollback on failure."),
      bullet("Built-in loading, error, and success states without manual useState/useEffect orchestration."),
      note("Prefer React Query (or RTK Query) over manual fetch+useEffect patterns for any server-derived data. It eliminates entire classes of bugs around race conditions and stale closures."),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════════
      // SECTION 4 — ROUTING
      // ═══════════════════════════════════════════
      h1("4. Routing"),

      h2("4.1 React Router"),
      body("React Router (v6+) is the standard client-side routing library. It maps URL paths to components using a declarative JSX-based API."),
      bullet("BrowserRouter wraps the app and enables HTML5 history API routing."),
      bullet("Routes and Route define the path-to-component mapping."),
      bullet("useParams — extracts dynamic URL segments."),
      bullet("useNavigate — programmatic navigation."),
      bullet("Outlet — renders matched child routes in nested layouts."),
      bullet("loader / action functions (v6.4+) — co-locate data fetching with routes (similar to Next.js getServerSideProps)."),
      space(),
      body("Route guards are implemented by wrapping Route children in components that check auth state and redirect using <Navigate> if access is denied."),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════════
      // SECTION 5 — PERFORMANCE
      // ═══════════════════════════════════════════
      h1("5. Performance Optimization"),

      h2("5.1 Lazy Loading"),
      body("Lazy loading defers the loading of components or assets until they are actually needed, reducing the amount of JavaScript parsed and executed on initial load."),
      bullet("React.lazy() dynamically imports a component. Always pair with <Suspense fallback={...}>."),
      bullet("Route-level lazy loading is the highest-impact pattern — each route chunk loads only when navigated to."),
      bullet("Images: use loading='lazy' on <img> or the IntersectionObserver API for custom triggers."),
      code("const Dashboard = React.lazy(() => import('./Dashboard'));"),
      space(),

      h2("5.2 Code Splitting"),
      body("Code splitting breaks your JavaScript bundle into smaller chunks that are loaded on demand rather than upfront. This directly reduces Time to Interactive (TTI)."),
      bullet("React.lazy + dynamic import() — component-level splitting handled by Webpack/Vite automatically."),
      bullet("Route-based splitting — the most impactful split point; ship only what the current page needs."),
      bullet("Vendor splitting — separate node_modules from app code so vendor bundles can be cached independently."),
      bullet("Webpack SplitChunksPlugin or Vite's built-in Rollup splitting handles chunk boundaries automatically."),
      space(),

      h2("5.3 Bundle Size Optimization"),
      body("Every kilobyte of JavaScript has a cost: download, parse, and execution time. Minimising bundle size improves all performance metrics."),
      bullet("Audit with webpack-bundle-analyzer or source-map-explorer to visualise what is in your bundle."),
      bullet("Replace heavy dependencies — e.g., swap moment.js for date-fns or Day.js (fraction of the size)."),
      bullet("Use production builds (NODE_ENV=production) which enable minification and dead-code elimination."),
      bullet("Enable Brotli or gzip compression on the server/CDN — typically 70-80% size reduction."),
      bullet("Prefer ES module packages that support tree shaking over CommonJS bundles."),
      space(),

      h2("5.4 Tree Shaking"),
      body("Tree shaking is a form of dead code elimination performed at build time by analysing the static import/export graph of ES modules. Code that is never imported is excluded from the final bundle."),
      bullet("Only works with ES module syntax (import/export). CommonJS require() is not tree-shakeable."),
      bullet("Import named exports rather than entire modules: import { debounce } from 'lodash-es' vs import _ from 'lodash'."),
      bullet("Mark packages as side-effect free in package.json: \"sideEffects\": false."),
      bullet("Webpack (production mode) and Vite (Rollup-based) both perform tree shaking automatically."),
      space(),

      h2("5.5 Memoization (useMemo, useCallback)"),
      body("See Section 2.3. In the context of performance, memoization is most impactful for:"),
      bullet("Heavy computations (sorting/filtering large lists) — use useMemo."),
      bullet("Stable callback props passed to child components wrapped in React.memo — use useCallback."),
      bullet("React.memo() wraps a function component and performs a shallow prop comparison to skip re-renders."),
      bullet("Profile first with React DevTools Profiler before adding memoization — it adds cognitive overhead and can hurt performance if overused due to comparison cost."),
      space(),

      h2("5.6 Pagination & Infinite Scroll"),
      h3("Pagination"),
      body("Pagination divides large data sets into discrete pages, loading only one page at a time. This is the standard pattern for search results, data tables, and admin lists."),
      bullet("Server-side pagination sends limit and offset (or page and pageSize) query parameters to the API."),
      bullet("UI displays page numbers or Previous/Next controls."),
      bullet("React Query's useQuery with a page key in the query key array makes page-based fetching straightforward."),
      space(),
      h3("Infinite Scroll"),
      body("Infinite scroll loads the next batch of items when the user approaches the bottom of the list, creating a continuous feed experience (social media, image galleries)."),
      bullet("Use IntersectionObserver to detect when a sentinel element enters the viewport."),
      bullet("React Query's useInfiniteQuery manages paginated data as a list of pages with built-in fetchNextPage."),
      bullet("Virtualisation (react-window or @tanstack/react-virtual) is critical for long lists — it renders only visible rows in the DOM, keeping memory and paint costs constant."),
      space(),

      h2("5.7 Debouncing"),
      body("Debouncing delays execution of a function until a specified time has passed since the last invocation. It prevents flooding the server or triggering expensive operations on every keystroke."),
      bullet("Common use cases: search-as-you-type, resize/scroll handlers, form autosave."),
      bullet("Implement with a setTimeout that resets on each call, or use lodash.debounce / use-debounce."),
      bullet("Throttling is the related pattern — it guarantees the function runs at most once per interval, regardless of how many calls occur."),
      code("const debouncedSearch = useDebounce(searchTerm, 300);"),
      space(),

      h2("5.8 Image Optimization"),
      body("Images are typically the largest assets on a page. Optimising them is one of the highest-return performance investments."),
      bullet("Use modern formats: WebP offers ~30% smaller files than JPEG at equivalent quality; AVIF offers ~50% smaller files than JPEG for many images."),
      bullet("Serve responsive images: <img srcSet='...' sizes='...'> sends the right resolution for each screen density."),
      bullet("Lazy load below-the-fold images with loading='lazy' (native browser attribute)."),
      bullet("Next.js <Image> component handles WebP conversion, responsive sizes, lazy loading, and layout shift prevention automatically."),
      bullet("Use a CDN with on-the-fly image transformation (Cloudinary, imgix, Vercel Image Optimization) to avoid manual resizing."),
      space(),

      h2("5.9 Core Web Vitals (LCP, INP, CLS)"),
      body("Core Web Vitals are Google's field metrics for real-world page experience. They directly affect Search ranking since 2021."),
      twoColTable([
        ["Metric", "What It Measures & Target"],
        ["LCP — Largest Contentful Paint", "How fast the largest visible element (hero image, heading) loads. Target: < 2.5 s"],
        ["INP — Interaction to Next Paint", "Responsiveness of all user interactions throughout the page lifecycle. Target: < 200 ms"],
        ["CLS — Cumulative Layout Shift", "Visual stability — how much content shifts unexpectedly. Target: < 0.1"],
      ]),
      space(),
      bullet("Improve LCP: preload hero images, use a CDN, reduce server response time, use SSR or SSG."),
      bullet("Improve INP: break up long tasks (> 50 ms), use web workers, defer non-critical JS."),
      bullet("Improve CLS: always set explicit width/height on images and iframes, avoid inserting content above existing content."),
      space(),

      h2("5.10 Optimistic UI Updates"),
      body("Optimistic updates apply the expected result of a mutation immediately in the UI — before the server responds — then reconcile with the actual server response when it arrives."),
      bullet("Gives users immediate feedback, making the app feel instantaneous even over slow connections."),
      bullet("If the server returns an error, roll back the optimistic state and notify the user."),
      bullet("React Query's useMutation supports onMutate (apply optimistic update) and onError (rollback) out of the box."),
      bullet("Critical for collaborative tools, like/unlike buttons, drag-and-drop reordering, and real-time feeds."),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════════
      // SECTION 6 — DATA FETCHING & APIs
      // ═══════════════════════════════════════════
      h1("6. Data Fetching & APIs"),

      h2("6.1 REST vs GraphQL"),
      twoColTable([
        ["REST", "GraphQL"],
        ["Multiple endpoints per resource", "Single /graphql endpoint"],
        ["Server defines response shape", "Client specifies exactly what fields to return"],
        ["Over-fetching: returns entire resource", "Precise fetching — no over- or under-fetching"],
        ["Under-fetching: may need multiple requests", "Single request can span multiple resource types"],
        ["HTTP caching works naturally (GET)", "Requires client-side cache (Apollo, urql)"],
        ["Simpler tooling, widely understood", "Powerful for complex, nested data models"],
        ["Best for: CRUD APIs, public APIs", "Best for: complex product UIs, mobile clients"],
      ]),
      space(),

      h2("6.2 Axios"),
      body("Axios is a promise-based HTTP client for both browser and Node.js. Its key advantages over the native Fetch API:"),
      bullet("Interceptors — transform requests and responses globally (add auth headers, log, handle 401 errors centrally)."),
      bullet("Automatic JSON serialisation/deserialisation — no need to call .json() manually."),
      bullet("Request cancellation via AbortController (Axios 1.x) or CancelToken (legacy)."),
      bullet("Consistent API across browsers including older ones."),
      note("For new projects, consider pairing the native fetch() with React Query rather than adding Axios — this eliminates a dependency while React Query provides caching, retries, and loading states."),
      space(),

      h2("6.3 WebSocket"),
      body("WebSocket provides a persistent, full-duplex communication channel between client and server over a single TCP connection. Unlike HTTP, the server can push data to the client at any time without a request."),
      bullet("Use cases: live chat, collaborative editing, real-time dashboards, notifications, multiplayer games."),
      bullet("The native WebSocket API (new WebSocket(url)) is straightforward for simple cases."),
      bullet("Socket.IO adds rooms, namespaces, automatic reconnection, and fallback to long-polling."),
      bullet("In React, open the WebSocket in useEffect and close it in the cleanup function to avoid memory leaks."),
      bullet("For read-heavy real-time data (feeds, notifications), Server-Sent Events (SSE) may be a simpler alternative."),
      space(),

      h2("6.4 Caching (Client + Server)"),
      h3("Client-side caching"),
      bullet("React Query / SWR — in-memory cache keyed by query keys. Configurable stale time, cache time, and background refetching."),
      bullet("HTTP cache headers — Cache-Control, ETag, Last-Modified allow the browser to reuse previously fetched responses."),
      bullet("Service Workers — intercept network requests and serve cached responses for offline support (Workbox)."),
      space(),
      h3("Server-side caching"),
      bullet("CDN caching — cache static assets and SSR responses at the edge, close to users (Cloudflare, Fastly, Vercel Edge)."),
      bullet("Redis / Memcached — in-memory key-value stores for database query results and session data."),
      bullet("HTTP stale-while-revalidate — serve cached content immediately while fetching fresh data in the background."),
      bullet("Next.js revalidate (ISR) — regenerate static pages at a configurable interval without a full rebuild."),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════════
      // SECTION 7 — AUTH
      // ═══════════════════════════════════════════
      h1("7. Authentication & Security"),

      h2("7.1 Authentication vs Authorization"),
      twoColTable([
        ["Authentication (AuthN)", "Authorization (AuthZ)"],
        ["Proves who you are", "Determines what you may do"],
        ["Login: username + password, OAuth, biometrics", "RBAC, ABAC, permission checks"],
        ["Produces a credential (JWT, session cookie)", "Validates the credential against resource permissions"],
        ["Happens once per session", "Happens on every protected request/action"],
      ]),
      space(),

      h2("7.2 Local Storage vs Cookies"),
      twoColTable([
        ["Local Storage", "Cookies"],
        ["~5 MB per origin", "~4 KB per cookie"],
        ["Not sent with HTTP requests automatically", "Sent automatically with every request to the domain"],
        ["Accessible via JavaScript only", "Accessible via JavaScript (unless HttpOnly)"],
        ["Vulnerable to XSS (JS can read it)", "HttpOnly cookies are invisible to JS — XSS-safe"],
        ["Not vulnerable to CSRF", "Vulnerable to CSRF (mitigated with SameSite + CSRF tokens)"],
        ["Good for: non-sensitive preferences, theme", "Good for: auth tokens (with HttpOnly + Secure + SameSite)"],
      ]),
      space(),
      note("The most secure pattern for auth tokens is HttpOnly + Secure + SameSite=Strict cookies. This makes the token inaccessible to JavaScript (defeating XSS token theft) while SameSite defeats CSRF."),
      space(),

      h2("7.3 JWT, OAuth & Session-based Auth"),
      bullet("JWT (JSON Web Token) — a signed, self-contained token encoding claims (user ID, roles, expiry). Stateless: the server verifies the signature without a database lookup. Rotate with short expiry + refresh tokens."),
      bullet("OAuth 2.0 — delegation protocol allowing users to authenticate via a third party (Google, GitHub). The app receives an access token scoped to specific resources."),
      bullet("Session-based — the server stores session data; the client holds only a session ID in a cookie. Stateful: requires sticky sessions or shared session storage (Redis) for horizontal scaling."),
      bullet("Multi-factor Authentication (MFA) — adds a second factor (TOTP, SMS, hardware key) to any of the above."),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════════
      // SECTION 8 — RENDERING STRATEGIES
      // ═══════════════════════════════════════════
      h1("8. Rendering Strategies"),

      h2("8.1 CSR vs SSR vs SSG vs ISR"),
      twoColTable([
        ["Strategy", "How It Works & When to Use"],
        ["CSR — Client-Side Rendering", "Browser downloads a minimal HTML shell + JS bundle. React renders in the browser. Fast navigation after load. Poor SEO & slow initial paint. Best for: dashboards, auth-gated apps."],
        ["SSR — Server-Side Rendering", "Server renders full HTML per request. Browser receives ready-to-display HTML. Good SEO, fast FCP. Higher server cost. Best for: e-commerce, news, personalised pages."],
        ["SSG — Static Site Generation", "Pages are pre-rendered at build time. CDN serves pre-built HTML — extremely fast. No dynamic data per request. Best for: blogs, docs, marketing sites."],
        ["ISR — Incremental Static Regeneration", "SSG pages are regenerated in the background at a configurable interval or on-demand. Combines CDN speed with fresh data. Next.js-specific. Best for: product catalogues, frequently updated static pages."],
      ]),
      space(),

      h2("8.2 Next.js"),
      body("Next.js is the dominant React meta-framework supporting all four rendering strategies, file-based routing, API routes, image optimisation, and edge middleware out of the box."),
      bullet("getServerSideProps — SSR: runs on every request, returns props."),
      bullet("getStaticProps + getStaticPaths — SSG with dynamic routes."),
      bullet("revalidate in getStaticProps — enables ISR."),
      bullet("app/ directory (Next.js 13+) — introduces React Server Components (RSC), which render on the server with zero client JS by default."),
      bullet("Middleware — runs at the edge before the request reaches a page, ideal for auth guards and A/B testing."),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════════
      // SECTION 9 — TOOLING & BUILD
      // ═══════════════════════════════════════════
      h1("9. Tooling & Build"),

      h2("9.1 Webpack"),
      body("Webpack is the most widely used module bundler in the React ecosystem. It resolves a dependency graph from an entry point and produces one or more optimised output bundles."),
      bullet("Loaders — transform non-JS files before they enter the graph (babel-loader for JSX/TS, css-loader, file-loader for images)."),
      bullet("Plugins — extend the build pipeline (HtmlWebpackPlugin, MiniCssExtractPlugin, DefinePlugin for env vars)."),
      bullet("Code splitting — dynamic import() and SplitChunksPlugin produce on-demand chunks."),
      bullet("Tree shaking — enabled automatically in production mode via the mode: 'production' option."),
      bullet("Source maps — map minified code back to source for debugging (devtool option)."),
      space(),

      h2("9.2 Vite"),
      body("Vite is the modern alternative to Webpack for development servers. It uses native ES modules in the browser during development (no bundle step), making hot module replacement (HMR) near-instant."),
      bullet("Development — serves source files as native ESM. HMR updates only the changed module."),
      bullet("Production — Rollup-based bundler with tree shaking, code splitting, and optimised output."),
      bullet("Significantly faster cold starts compared to Webpack for large projects."),
      bullet("First-class React support via @vitejs/plugin-react (Babel) or @vitejs/plugin-react-swc (SWC — even faster)."),
      space(),

      h2("9.3 Polyfills & Babel"),
      body("Babel transpiles modern JavaScript (ES2020+, JSX, TypeScript) into syntax that older browsers can execute. Polyfills patch missing runtime APIs that transpilation alone cannot provide."),
      bullet("@babel/preset-env uses a browserslist target to transpile only what is needed for your target browsers."),
      bullet("core-js provides polyfills for Array.prototype.flat, Promise.allSettled, etc."),
      bullet("SWC (Speedy Web Compiler) is a Rust-based alternative to Babel — significantly faster with equivalent output."),
      bullet("Polyfills increase bundle size — always target only the browsers you need to support."),
      bullet("Modern tools (Vite, Next.js) handle Babel/SWC configuration automatically; manual config is rarely needed."),
      space(),

      h2("9.4 Cross-Browser Compatibility"),
      body("Ensuring your application behaves consistently across Chrome, Firefox, Safari, and Edge requires a combination of transpilation, polyfills, and testing."),
      bullet("CSS: use Autoprefixer (via PostCSS) to add vendor prefixes automatically. Avoid bleeding-edge CSS features without a fallback."),
      bullet("JS: Babel + core-js covers most compatibility gaps. Check Can I Use for feature support tables."),
      bullet("Testing: BrowserStack or Sauce Labs for real device cross-browser testing. Playwright supports Chromium, Firefox, and WebKit (Safari engine)."),
      bullet("Safari quirks: flexbox gaps, date parsing differences, and absence of some modern APIs are common pain points."),
      bullet("Use feature detection (if ('IntersectionObserver' in window)) over user-agent sniffing."),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════════
      // SECTION 10 — ARCHITECTURE
      // ═══════════════════════════════════════════
      h1("10. Architecture"),

      h2("10.1 Micro-frontend Architecture"),
      body("Micro-frontends extend the microservices philosophy to the frontend — splitting a large monolithic SPA into independently deployable units, each owned by a separate team."),
      h3("Integration approaches"),
      bullet("Module Federation (Webpack 5) — the most popular approach. Host app dynamically loads remote modules at runtime. Teams deploy their micro-frontends independently."),
      bullet("iframes — maximum isolation but poor UX and complex communication."),
      bullet("Web Components — framework-agnostic custom elements that encapsulate UI and logic."),
      bullet("Monorepo with shared packages — not true micro-frontends but a common middle ground for code sharing without runtime integration."),
      space(),
      h3("Trade-offs"),
      bullet("Advantages: independent deployments, team autonomy, technology flexibility, smaller blast radius for failures."),
      bullet("Disadvantages: increased infrastructure complexity, potential bundle duplication, harder to enforce consistent UX, performance overhead from multiple independent bundles."),
      note("Micro-frontends add significant operational complexity. Adopt them when team size and deployment frequency genuinely justify it — not as a default architecture."),
      space(),

      h2("10.2 OpenGraph"),
      body("OpenGraph is a protocol (originally from Facebook) that defines meta tags in the HTML <head> to control how a URL is represented when shared on social media, messaging apps, and link previews."),
      bullet("og:title, og:description, og:image, og:url are the essential tags."),
      bullet("In React SPAs, use react-helmet or Next.js <Head> to inject these tags dynamically per page."),
      bullet("Crucial for SEO and social sharing — a missing og:image means no preview thumbnail on Twitter/LinkedIn."),
      space(),

      h2("10.3 Time-Travel Debugging"),
      body("Time-travel debugging records the state of an application at each action dispatch, allowing developers to step forward and backward through the history to pinpoint exactly when and why a bug occurred."),
      bullet("Redux DevTools browser extension enables time-travel for any Redux-based application."),
      bullet("Replaying a sequence of actions to reproduce a bug eliminates the need to manually recreate complex UI states."),
      bullet("Also useful for recording sessions to share exact reproduction steps with teammates."),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════════
      // SECTION 11 — TESTING
      // ═══════════════════════════════════════════
      h1("11. Testing"),

      h2("11.1 Testing Pyramid"),
      body("A well-tested frontend has three layers:"),
      bullet("Unit tests — test individual functions, hooks, and utilities in isolation. Fastest, most numerous. Tool: Jest."),
      bullet("Integration tests — test a component in context: renders it, simulates user interactions, asserts on DOM output. Tool: React Testing Library (RTL)."),
      bullet("End-to-end tests — drive a real browser through complete user journeys. Slowest, fewest. Tool: Playwright or Cypress."),
      space(),

      h2("11.2 Jest"),
      body("Jest is the standard JavaScript test runner and assertion library for React projects."),
      bullet("describe() and it() / test() structure test suites."),
      bullet("expect() with matchers (toBe, toEqual, toHaveBeenCalledWith, etc.) makes assertions."),
      bullet("jest.fn() creates mock functions; jest.mock() mocks entire modules."),
      bullet("Snapshot testing with toMatchSnapshot() captures component output for regression detection."),
      bullet("Code coverage with --coverage flag; configure thresholds in jest.config."),
      space(),

      h2("11.3 React Testing Library (RTL)"),
      body("RTL tests components the way users interact with them — by querying the DOM for accessible elements rather than implementation details."),
      bullet("Queries: getByRole, getByLabelText, getByText, getByPlaceholderText — prefer in that order (most to least accessible)."),
      bullet("userEvent.click(), userEvent.type() simulate realistic user interactions."),
      bullet("waitFor() and findBy* queries handle async rendering and data fetching."),
      bullet("Never test implementation details (state variables, internal methods) — test observable behaviour."),
      space(),

      h2("11.4 Playwright"),
      body("Playwright is a modern E2E testing framework that supports Chromium, Firefox, and WebKit from a single API."),
      bullet("page.goto(), page.click(), page.fill(), page.waitForSelector() drive the browser."),
      bullet("Auto-wait — Playwright automatically waits for elements to be actionable before interacting."),
      bullet("Network interception — mock API responses to test loading/error states reliably."),
      bullet("Visual regression testing — compare screenshots across builds to catch unintended UI changes."),
      bullet("Codegen — record user interactions to generate test boilerplate automatically."),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════════
      // SECTION 12 — ACCESSIBILITY
      // ═══════════════════════════════════════════
      h1("12. Accessibility (a11y)"),

      h2("12.1 Why Accessibility Matters"),
      body("Accessibility ensures your application is usable by people with visual, motor, auditory, or cognitive disabilities. It is also a legal requirement in many jurisdictions (ADA, WCAG 2.1 AA) and improves SEO."),

      h2("12.2 Core Principles"),
      bullet("Semantic HTML — use <button> for buttons, <nav> for navigation, <main> for main content. Screen readers rely on semantics."),
      bullet("Keyboard navigation — every interactive element must be reachable and operable via keyboard alone (Tab, Enter, Space, Arrow keys)."),
      bullet("ARIA attributes — aria-label, aria-describedby, aria-expanded, role supplement HTML semantics for custom components. Use sparingly — correct semantic HTML is always preferable."),
      bullet("Colour contrast — text must meet WCAG AA ratio of 4.5:1 for normal text, 3:1 for large text."),
      bullet("Focus management — after opening a modal or dialog, move focus into it; return focus when it closes."),
      bullet("Alternative text — all meaningful images need descriptive alt text; decorative images need alt=''."),
      space(),

      h2("12.3 Tooling"),
      bullet("axe-core / eslint-plugin-jsx-a11y — static analysis catching common accessibility violations at development time."),
      bullet("React Testing Library — encourages accessible queries (getByRole, getByLabelText) that align with screen reader behaviour."),
      bullet("Lighthouse / axe DevTools — audit tool for automated accessibility scoring."),
      bullet("Manual testing with NVDA (Windows), JAWS, or VoiceOver (macOS/iOS) remains essential."),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════════
      // SECTION 13 — OTHER TOPICS
      // ═══════════════════════════════════════════
      h1("13. Additional Topics"),

      h2("13.1 OpenLayers"),
      body("OpenLayers is a powerful open-source JavaScript library for displaying interactive maps and geospatial data. In React, initialise the map in a useEffect with a ref-attached container, and clean up in the return function."),
      bullet("Supports tile layers (OpenStreetMap, Bing, custom WMS/WMTS), vector layers, and overlays."),
      bullet("Projections, coordinate transforms, and feature selection are built in."),
      bullet("For React-native map integration, react-ol (ol-react) provides component wrappers."),
      space(),

      h2("13.2 Rules of Hooks"),
      body("React enforces two rules for hooks:"),
      bullet("Only call hooks at the top level — never inside loops, conditionals, or nested functions. This guarantees hook call order is stable across renders."),
      bullet("Only call hooks from React function components or custom hooks — not from regular JS functions or class components."),
      bullet("ESLint plugin eslint-plugin-react-hooks enforces both rules automatically."),
      space(),

      h2("13.3 Vite (Summary)"),
      body("Vite replaces Create React App for new projects. It starts instantly (native ESM dev server), supports TypeScript and JSX with zero config, and produces optimised production builds via Rollup. The go-to choice for new React projects in 2026."),

      divider(),
      space(),
      new Paragraph({
        spacing: { before: 200, after: 100 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "React Frontend Complete Reference Guide — 2026 Edition", size: 18, color: GRAY, font: "Arial", italics: true })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  const outputPath = path.join(__dirname, 'React_Frontend_2026.docx');
  fs.writeFileSync(outputPath, buf);
  console.log(`Done. Document saved to: ${outputPath}`);
});
