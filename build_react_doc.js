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

function flexibleTable(rows) {
  const TOTAL_WIDTH = 9720; // Available width within margins
  const border = { style: BorderStyle.SINGLE, size: 1, color: "BDBDBD" };
  const borders = { top: border, bottom: border, left: border, right: border };
  
  // Determine max columns in the dataset to calculate width
  const maxCols = Math.max(...rows.map(r => r.length));
  const colWidth = Math.floor(TOTAL_WIDTH / maxCols);

  return new Table({
    width: { size: TOTAL_WIDTH, type: WidthType.DXA },
    columnWidths: Array(maxCols).fill(colWidth),
    rows: rows.map((row, i) => new TableRow({
      children: row.map(cell => new TableCell({
        borders,
        width: { size: colWidth, type: WidthType.DXA },
        shading: { fill: i === 0 ? MID : (i % 2 === 0 ? LIGHT : WHITE), type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 120, right: 120 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [new TextRun({
            text: cell,
            bold: i === 0,
            size: i === 0 ? 20 : 18,
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
        children: [new TextRun({ text: "The 25 Core Concepts", bold: true, size: 52, color: BRAND, font: "Arial" })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 1440 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "2026 Comprehensive Interview Guide", size: 36, color: GRAY, font: "Arial" })]
      }),
      new Paragraph({ children: [new PageBreak()] }),

      h1("Detailed Analysis of 25 Core Frontend Concepts"),
      body("This guide provides in-depth technical explanations for the 25 most critical topics in modern frontend engineering. Each entry is designed to provide comprehensive context, architectural trade-offs, and practical implementation details."),
      space(),

      // 1. Pagination
      h2("1. Pagination"),
      body("Pagination is the architectural strategy of partitioning large datasets into smaller, manageable chunks (pages). It is the primary defense against 'DOM bloat' and excessive network latency."),
      h3("Implementation Strategies"),
      bullet("Offset-based: Uses SQL-style LIMIT and OFFSET. Pros: Easy to jump to specific pages. Cons: Inefficient for deep pages as the DB must still scan skipped rows; prone to 'drifting' (skipping or duplicating items if data changes during navigation)."),
      bullet("Cursor-based: Uses a unique pointer (e.g., a timestamp or ID) from the last item. Pros: Highly performant at scale; resilient to data insertions. Cons: Cannot easily 'jump' to page 50; usually only supports 'Next' and 'Previous'."),
      h3("Best Practices"),
      bullet("Always implement server-side pagination for lists exceeding 100 items."),
      bullet("Use 'skeletons' or 'shimmer' effects to maintain layout stability during page transitions."),
      bullet("Synchronize the page state with the URL (e.g., ?page=2) to allow users to share specific views."),
      code("const fetchPage = async (page) => { const res = await fetch(`/api/data?page=${page}`); return res.json(); };"),
      space(),

      // 2. Infinite Scroll
      h2("2. Infinite Scroll"),
      body("Infinite scroll provides a frictionless experience by loading the next set of data as the user approaches the end of the current content."),
      h3("The Technical Stack"),
      bullet("Intersection Observer API: The modern standard for detecting when a 'sentinel' element enters the viewport. Significantly more performant than legacy 'scroll' event listeners."),
      bullet("Virtualization (Windowing): Essential for infinite feeds. It renders only the DOM nodes currently visible on screen. Use libraries like @tanstack/react-virtual or react-window to prevent the browser from slowing down as the list grows."),
      h3("UX & Trade-offs"),
      bullet("Avoid infinite scroll for data-heavy admin tables where users need to find specific records reliably."),
      bullet("Ensure a 'Loading' state is visible so users don't think the app has crashed at the end of the list."),
      bullet("Consider the 'Load More' button pattern for mobile users to save battery and data usage."),
      space(),

      // 3. Debouncing
      h2("3. Debouncing"),
      body("Debouncing is a programming pattern that limits the rate at which a function can fire. It ensures that a task is only triggered once a certain amount of time has passed since its last invocation."),
      h3("Deep Dive"),
      bullet("Mechanism: Every time the event fires, we clear the existing timer and start a new one. The function only executes if the timer reaches its duration without being cleared."),
      bullet("Search-as-you-type: A classic use case. Without debouncing, a 10-letter search would trigger 10 API calls. With a 300ms debounce, it triggers exactly one."),
      h3("Custom Hook Implementation"),
      code("function useDebounce(value, delay) { const [debouncedValue, setDebouncedValue] = useState(value); useEffect(() => { const handler = setTimeout(() => setDebouncedValue(value), delay); return () => clearTimeout(handler); }, [value, delay]); return debouncedValue; }"),
      note("Interview Tip: Be ready to explain the difference between Debouncing (waits for a pause) and Throttling (enforces a maximum frequency)."),
      space(),

      // 4. WebSocket
      h2("4. WebSocket"),
      body("WebSocket (RFC 6455) is a protocol that allows for full-duplex communication over a single, long-lived TCP connection. It is the backbone of real-time web applications."),
      h3("Lifecycle of a Connection"),
      bullet("Opening: The client sends an HTTP GET request with an 'Upgrade: websocket' header. If the server supports it, it returns a 101 Switching Protocols response."),
      bullet("Data Transfer: Communication happens via 'frames'. Minimal headers make it much faster than polling HTTP."),
      bullet("Heartbeats: Clients and servers send 'ping' and 'pong' frames to ensure the connection is still alive, especially through aggressive corporate proxies/firewalls."),
      h3("Scalability Challenges"),
      bullet("Load Balancing: Unlike HTTP, WebSockets are stateful. You need 'sticky sessions' or a shared state backplane (Redis) to route messages to the correct server instance."),
      bullet("Security: Use 'wss://' (TLS) to prevent injection attacks and snooping."),
      space(),

      // 5. REST vs GraphQL
      h2("5. REST vs GraphQL"),
      body("Choosing between REST and GraphQL is a choice between endpoint stability and client-side flexibility."),
      flexibleTable([
        ["Criteria", "REST", "GraphQL"],
        ["Fetching", "Multiple endpoints (GET /users, /posts)", "Single endpoint (/graphql)"],
        ["Over-fetching", "Common: returns entire user object", "None: client selects specific fields"],
        ["Under-fetching", "Common: requires multiple round-trips", "None: nested queries fetch all at once"],
        ["Versioning", "URL-based (/v1, /v2)", "Evolutionary (deprecate fields)"],
        ["Caching", "Native browser/CDN (via URL)", "Complex; requires client-side cache"],
      ]),
      h3("When to choose GraphQL"),
      bullet("Large, complex data models with deep nesting."),
      bullet("Mobile clients where minimizing payload size and network round-trips is critical."),
      bullet("Rapidly evolving UIs where front-end teams need to change data requirements without back-end changes."),
      space(),

      // 6. Local Storage vs Cookies
      h2("6. Local Storage vs Cookies"),
      body("Persistence and security are the two dimensions for evaluating browser storage."),
      h3("The Comparison"),
      bullet("Local Storage: Synchronous API, ~5MB capacity. Persists across sessions. Excellent for UI state, themes, and non-sensitive data. CRITICAL: Vulnerable to XSS—any malicious script can read the entire storage."),
      bullet("Cookies: Small capacity (~4KB). Automatically sent with HTTP requests. The 'HttpOnly' flag makes them invisible to JavaScript, providing a robust defense against XSS-based token theft."),
      h3("Security Best Practices"),
      bullet("Never store JWTs or session IDs in Local Storage."),
      bullet("Use Cookies with 'HttpOnly', 'Secure', and 'SameSite=Strict' for all sensitive authentication tokens."),
      bullet("Use IndexedDB for large datasets (e.g., offline-first PWA data)."),
      space(),

      // 7. Authentication vs Authorization
      h2("7. Authentication vs Authorization"),
      body("Security logic is divided into identifying the user and then verifying their rights."),
      h3("The Two Pillars"),
      bullet("Authentication (AuthN): 'Who are you?' Verified via passwords, biometrics, or OAuth2 providers (Google, Apple). Result: A session or a JWT."),
      bullet("Authorization (AuthZ): 'What can you do?' Verified via RBAC (Role-Based Access Control) or ABAC (Attribute-Based Access Control). Defines if a user can delete a post or access an admin panel."),
      h3("Modern Standards"),
      bullet("OAuth 2.0: An authorization framework for delegating access."),
      bullet("OIDC (OpenID Connect): An authentication layer on top of OAuth 2.0."),
      bullet("JWT: A signed, self-contained token containing 'claims' about a user's identity and permissions."),
      space(),

      // 8. Redux
      h2("8. Redux"),
      body("Redux is a predictable, centralized state container. It is best suited for applications where state transitions are complex and need to be consistent across the entire app."),
      h3("Redux Toolkit (RTK) — The Modern Way"),
      bullet("createSlice: Combines actions and reducers into a single object, eliminating 'action-type' boilerplate."),
      bullet("Immer: RTK uses Immer under the hood, allowing you to write 'mutative' code (state.count++) while keeping the underlying state immutable."),
      bullet("RTK Query: A built-in solution for data fetching that handles caching, loading states, and polling automatically."),
      h3("When to use Redux?"),
      bullet("When multiple components, far apart in the tree, need to sync with the same piece of data."),
      bullet("When you need 'Time Travel Debugging' or a globally consistent undo/redo history."),
      space(),

      // 9. Lazy Loading
      h2("9. Lazy Loading"),
      body("Lazy loading is an optimization technique that defers the loading of non-critical resources at page load time."),
      h3("React Implementation"),
      bullet("React.lazy(): Dynamically imports a component. It must be rendered inside a <Suspense> boundary."),
      bullet("Suspense: Provides a declarative way to specify a fallback UI (like a spinner) while the lazy component is being downloaded."),
      h3("Benefits"),
      bullet("Reduction in 'Main Thread' blockage: By shipping less JS initially, the browser can parse and execute code faster."),
      bullet("Improved FCP (First Contentful Paint): The user sees the 'shell' of the app sooner."),
      code("const MyChart = React.lazy(() => import('./MyChart'));"),
      space(),

      // 10. Code Splitting
      h2("10. Code Splitting"),
      body("Code splitting is the process of breaking a monolithic JavaScript bundle into smaller 'chunks' that can be loaded on demand."),
      h3("Splitting Strategies"),
      bullet("Route-based: Each route (Home, Dashboard, Settings) is its own bundle. The user only loads the code for the page they are on."),
      bullet("Component-based: Large, heavy components (e.g., a Rich Text Editor) are split out and loaded only when the user interacts with them."),
      bullet("Vendor splitting: Bundling all third-party libraries (lodash, d3) into a separate 'vendor.js' file to leverage long-term browser caching."),
      note("Webpack and Vite handle this automatically via dynamic 'import()' syntax."),
      space(),

      // 11. Bundle Size Optimization
      h2("11. Bundle Size Optimization"),
      body("Bundle size directly correlates with 'Time to Interactive'. In 2026, a 1MB bundle is considered extremely heavy for mobile users."),
      h3("Optimization Checklist"),
      bullet("Minification: Removing whitespace, shortening variable names (handled by Terser/Esbuild)."),
      bullet("Compression: Serving files via Brotli (superior to Gzip) from the server or CDN."),
      bullet("Image Optimization: Serving WebP/AVIF instead of PNG, and using responsive image sizes."),
      bullet("Audit: Use 'webpack-bundle-analyzer' or 'source-map-explorer' to identify 'hidden' large dependencies."),
      space(),

      // 12. Tree Shaking
      h2("12. Tree Shaking"),
      body("Tree shaking is a form of dead code elimination that relies on the static structure of ES Modules."),
      h3("How to Enable It"),
      bullet("Use ES Modules: Always use 'import' and 'export' instead of 'require'. CommonJS cannot be tree-shaken reliably."),
      bullet("Side Effects: In package.json, mark your project as 'sideEffects: false' so the bundler knows it can safely remove unused exports."),
      bullet("Atomic Imports: Instead of 'import _ from \"lodash\"', use 'import { debounce } from \"lodash-es\"'."),
      note("Vite and Webpack (in production mode) perform tree shaking automatically, but developer awareness of import patterns is still critical."),
      space(),

      // 13. Memoization
      h2("13. Memoization"),
      body("Memoization is the process of caching the result of expensive computations to avoid redundant work."),
      h3("The React Hook Trio"),
      bullet("useMemo: Memoizes the result of a calculation. Use it when filtering large arrays or performing heavy math."),
      bullet("useCallback: Memoizes a function instance. Use it to prevent child components from re-rendering if they rely on a stable function reference for 'React.memo'."),
      bullet("React.memo: A HOC that wraps a component and skips re-renders if its props haven't changed (shallow comparison)."),
      h3("The Cost of Memoization"),
      bullet("Every useMemo/useCallback call has a small overhead (storing dependencies and comparing them). Don't use them for trivial operations."),
      space(),

      // 14. Caching
      h2("14. Caching"),
      body("Caching is a multi-layered strategy for data persistence and speed."),
      h3("The Layers"),
      bullet("HTTP Caching: 'Cache-Control' and 'ETags' allow the browser to reuse local files without asking the server."),
      bullet("CDN Caching: Storing content at the 'Edge' (Vercel, Cloudflare) to reduce the physical distance data travels."),
      bullet("Server-State Caching: Using TanStack Query (React Query) to cache API responses in memory. It provides 'Stale-While-Revalidate' (SWR) logic: show old data, fetch new data, update UI."),
      bullet("Service Workers: Intercepting network requests to provide offline functionality and near-instant loading for repeat visits."),
      space(),

      // 15. CSR vs SSR vs SSG vs ISR
      h2("15. CSR vs SSR vs SSG vs ISR"),
      body("Modern frameworks like Next.js allow you to mix and match these strategies per page."),
      flexibleTable([
        ["Strategy", "Best For", "Trade-off"],
        ["CSR (Client)", "Private dashboards", "Slow first paint, poor SEO"],
        ["SSR (Server)", "Dynamic news/feeds", "Higher server load, TTFB delay"],
        ["SSG (Static)", "Blogs, Marketing sites", "Build time grows with pages"],
        ["ISR (Incremental)", "E-commerce catalogs", "Complex cache invalidation logic"],
      ]),
      h3("The 'Hydration' Problem"),
      bullet("SSR/SSG sends HTML to the browser, but it's non-interactive until the JS loads and 'hydrates' the page. Selective hydration (React 18) helps solve this."),
      space(),

      // 16. Core Web Vitals
      h2("16. Core Web Vitals"),
      body("Google's metrics for quantifying 'User Experience'. They are a direct ranking factor for SEO."),
      h3("The Big Three"),
      bullet("LCP (Largest Contentful Paint): Measures loading speed. Target: < 2.5s. Optimize by preloading hero images and minimizing blocking JS."),
      bullet("INP (Interaction to Next Paint): Measures responsiveness to every click/keypress. Target: < 200ms. Optimize by yielding to the main thread (requestIdleCallback)."),
      bullet("CLS (Cumulative Layout Shift): Measures visual stability. Target: < 0.1. Optimize by setting 'width/height' on all images and ad-slots."),
      space(),

      // 17. Cross-Browser Compatibility
      h2("17. Cross-Browser Compatibility"),
      body("Even in 2026, browsers differ in their support for bleeding-edge CSS and JS features."),
      h3("The Toolchain"),
      bullet("PostCSS & Autoprefixer: Adds vendor prefixes (-webkit-) automatically."),
      bullet("Babel: Transpiles modern JS (ES2022) into older JS (ES6) for compatibility with older Safari or corporate browsers."),
      bullet("Polyfills: 'core-js' adds missing methods like .flatMap() at runtime."),
      bullet("Browserslist: A config file used by all the above to define which browsers you actually care about (e.g., 'last 2 versions')."),
      space(),

      // 18. Optimistic UI Updates
      h2("18. Optimistic UI Updates"),
      body("Optimistic UI assumes success to provide an instant response to user interaction."),
      h3("Workflow"),
      bullet("1. User clicks 'Like'. 2. UI heart turns red immediately. 3. API request is sent. 4. If API fails, UI 'rolls back' to the grey heart and shows a toast notification."),
      h3("Implementation Tip"),
      bullet("TanStack Query makes this easy via the 'onMutate' hook, which allows you to manually update the cache before the network request finishes."),
      space(),

      // 19. Suspense
      h2("19. Suspense"),
      body("Suspense is React's declarative way of handling 'waiting' for asynchronous operations."),
      h3("Key Capabilities"),
      bullet("Loading States: Wrap any component in <Suspense fallback={<Skeleton />}> to handle its loading state automatically."),
      bullet("Concurrent Rendering: React 18+ can 'interrupt' a long render to handle a user click, keeping the UI responsive."),
      bullet("Transitions: 'startTransition' allows you to mark a state update as 'non-urgent' so it doesn't trigger a loading spinner for fast users."),
      space(),

      // 20. Image Optimization
      h2("20. Image Optimization"),
      body("Images are usually the largest part of any webpage. Optimization is not optional."),
      h3("Modern Techniques"),
      bullet("Formats: WebP and AVIF provide much better compression than JPEG/PNG."),
      bullet("Responsive Images: Using the <picture> element and 'srcset' to send a small image to a phone and a high-res image to a Retina display."),
      bullet("Lazy Loading: Using 'loading=\"lazy\"' so the browser doesn't download images until they are near the viewport."),
      bullet("CDN: Using services like Cloudinary to resize and compress images on the fly via URL parameters."),
      space(),

      // 21. Accessibility (a11y)
      h2("21. Accessibility (a11y)"),
      body("Web accessibility ensures that people with disabilities can use your application."),
      h3("Core Concepts"),
      bullet("Semantic HTML: Using <main>, <nav>, and <button> correctly so screen readers understand the page structure."),
      bullet("ARIA: Using 'aria-label' and 'aria-expanded' to describe custom components (like a custom dropdown) that aren't native HTML."),
      bullet("Focus Management: Ensuring that when a modal opens, the 'focus' moves inside it and stays there (focus trap) until closed."),
      bullet("Contrast: Meeting WCAG AA standards (4.5:1 ratio) for text readability."),
      space(),

      // 22. Webpack
      h2("22. Webpack"),
      body("Webpack is the industry-standard module bundler for complex React applications."),
      h3("The Core Workflow"),
      bullet("Entry: Where Webpack starts looking for files. Output: Where the finished bundle goes."),
      bullet("Loaders: Transform non-JS files (CSS, Images, TypeScript) into JS modules."),
      bullet("Plugins: Perform high-level tasks like 'Tree Shaking', 'Code Splitting', and 'Minification'."),
      bullet("DevServer: Provides Hot Module Replacement (HMR) for a fast developer loop."),
      space(),

      // 23. Micro-frontend Architecture
      h2("23. Micro-frontend Architecture"),
      body("Micro-frontends apply the 'Microservices' pattern to the front end."),
      h3("Approaches"),
      bullet("Module Federation: Allows multiple Webpack builds to share code at runtime. Team A can deploy a 'Header' component that Team B consumes instantly."),
      bullet("iFrames: The simplest way to isolate teams, but creates UX and performance issues."),
      h3("Trade-offs"),
      bullet("Pros: Team autonomy, independent deployments, independent tech stacks."),
      bullet("Cons: Complex CI/CD, risk of bundle duplication, difficulty in maintaining a consistent design system."),
      space(),

      // 24. Testing — RTL, Jest, Playwright
      h2("24. Testing — RTL, Jest, Playwright"),
      body("A healthy test suite follows the 'Testing Pyramid' philosophy."),
      h3("The Three Layers"),
      bullet("Unit (Jest): Testing small logic functions and hooks in isolation. Fast and reliable."),
      bullet("Integration (React Testing Library): Testing components as the user would. Instead of checking 'state', check if the 'Submit' button exists and is clickable."),
      bullet("E2E (Playwright): Testing the full user journey in a real browser. Does the user get to the 'Success' page after checkout?"),
      space(),

      // 25. Polyfills & Babel
      h2("25. Polyfills & Babel"),
      body("Babel and Polyfills ensure your code runs everywhere."),
      h3("The Difference"),
      bullet("Babel (Transpiler): Changes 'Syntax'. It turns 'const' into 'var' and arrow functions into regular functions."),
      bullet("Polyfills (Runtime): Adds 'Features'. If a browser doesn't have 'Array.prototype.includes', a polyfill provides the missing code."),
      bullet("@babel/preset-env: A smart preset that looks at your 'browserslist' and automatically decides which transpilation and polyfills are needed."),
      space(),

      new Paragraph({ children: [new PageBreak()] }),

      h1("Foundational React Pillars"),
      h2("JSX"),
      body("JSX is syntactic sugar for React.createElement(). It allows you to express UI logic with an HTML-like syntax."),
      bullet("JSX is transpiled by Babel or SWC."),
      bullet("Curly braces {} allow embedding of any valid JavaScript expression."),
      bullet("Fragments <></> allow grouping elements without adding extra DOM nodes."),
      space(),

      h2("State vs Props"),
      body("Understanding data flow is the most fundamental skill in React."),
      bullet("Props: Immutable data passed from parent to child. Similar to function arguments."),
      bullet("State: Local, mutable data managed by the component itself. Triggers a re-render when updated."),
      bullet("Lifting State Up: The pattern of moving state to the nearest common ancestor to share data between siblings."),
      space(),

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
