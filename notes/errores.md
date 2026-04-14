react-dom_client.js?v=a1cfbe34:21549 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
Crafting.jsx:144 Uncaught ReferenceError: Cannot access 'selectedItem' before initialization
    at Crafting (Crafting.jsx:144:23)
    at renderWithHooks (react-dom_client.js?v=a1cfbe34:11546:26)
    at updateFunctionComponent (react-dom_client.js?v=a1cfbe34:14580:28)
    at mountLazyComponent (react-dom_client.js?v=a1cfbe34:14831:23)
    at beginWork (react-dom_client.js?v=a1cfbe34:15916:22)
    at HTMLUnknownElement.callCallback2 (react-dom_client.js?v=a1cfbe34:3672:22)
    at Object.invokeGuardedCallbackDev (react-dom_client.js?v=a1cfbe34:3697:24)
    at invokeGuardedCallback (react-dom_client.js?v=a1cfbe34:3731:39)
    at beginWork$1 (react-dom_client.js?v=a1cfbe34:19763:15)
    at performUnitOfWork (react-dom_client.js?v=a1cfbe34:19199:20)
Crafting.jsx:144 Uncaught ReferenceError: Cannot access 'selectedItem' before initialization
    at Crafting (Crafting.jsx:144:23)
    at renderWithHooks (react-dom_client.js?v=a1cfbe34:11546:26)
    at updateFunctionComponent (react-dom_client.js?v=a1cfbe34:14580:28)
    at mountLazyComponent (react-dom_client.js?v=a1cfbe34:14831:23)
    at beginWork (react-dom_client.js?v=a1cfbe34:15916:22)
    at HTMLUnknownElement.callCallback2 (react-dom_client.js?v=a1cfbe34:3672:22)
    at Object.invokeGuardedCallbackDev (react-dom_client.js?v=a1cfbe34:3697:24)
    at invokeGuardedCallback (react-dom_client.js?v=a1cfbe34:3731:39)
    at beginWork$1 (react-dom_client.js?v=a1cfbe34:19763:15)
    at performUnitOfWork (react-dom_client.js?v=a1cfbe34:19199:20)
react-dom_client.js?v=a1cfbe34:14030 The above error occurred in the <Crafting> component:

    at Crafting (http://localhost:5173/src/components/Crafting.jsx?t=1776119099450:66:36)
    at Suspense
    at TabErrorBoundary (http://localhost:5173/src/App.jsx?t=1776119127547:17:5)
    at main
    at div
    at div
    at App (http://localhost:5173/src/App.jsx?t=1776119127547:147:31)

React will try to recreate this component tree from scratch using the error boundary you provided, TabErrorBoundary.
logCapturedError @ react-dom_client.js?v=a1cfbe34:14030
App.jsx:28 Tab render error: Forja ReferenceError: Cannot access 'selectedItem' before initialization
    at Crafting (Crafting.jsx:144:23)
    at renderWithHooks (react-dom_client.js?v=a1cfbe34:11546:26)
    at updateFunctionComponent (react-dom_client.js?v=a1cfbe34:14580:28)
    at mountLazyComponent (react-dom_client.js?v=a1cfbe34:14831:23)
    at beginWork (react-dom_client.js?v=a1cfbe34:15916:22)
    at beginWork$1 (react-dom_client.js?v=a1cfbe34:19751:22)
    at performUnitOfWork (react-dom_client.js?v=a1cfbe34:19199:20)
    at workLoopSync (react-dom_client.js?v=a1cfbe34:19135:13)
    at renderRootSync (react-dom_client.js?v=a1cfbe34:19114:15)
    at recoverFromConcurrentError (react-dom_client.js?v=a1cfbe34:18734:28)
componentDidCatch @ App.jsx:28
Crafting.jsx:144 Uncaught ReferenceError: Cannot access 'selectedItem' before initialization
    at Crafting (Crafting.jsx:144:23)
    at renderWithHooks (react-dom_client.js?v=a1cfbe34:11546:26)
    at updateFunctionComponent (react-dom_client.js?v=a1cfbe34:14580:28)
    at mountLazyComponent (react-dom_client.js?v=a1cfbe34:14831:23)
    at beginWork (react-dom_client.js?v=a1cfbe34:15916:22)
    at HTMLUnknownElement.callCallback2 (react-dom_client.js?v=a1cfbe34:3672:22)
    at Object.invokeGuardedCallbackDev (react-dom_client.js?v=a1cfbe34:3697:24)
    at invokeGuardedCallback (react-dom_client.js?v=a1cfbe34:3731:39)
    at beginWork$1 (react-dom_client.js?v=a1cfbe34:19763:15)
    at performUnitOfWork (react-dom_client.js?v=a1cfbe34:19199:20)
Crafting.jsx:144 Uncaught ReferenceError: Cannot access 'selectedItem' before initialization
    at Crafting (Crafting.jsx:144:23)
    at renderWithHooks (react-dom_client.js?v=a1cfbe34:11546:26)
    at updateFunctionComponent (react-dom_client.js?v=a1cfbe34:14580:28)
    at mountLazyComponent (react-dom_client.js?v=a1cfbe34:14831:23)
    at beginWork (react-dom_client.js?v=a1cfbe34:15916:22)
    at HTMLUnknownElement.callCallback2 (react-dom_client.js?v=a1cfbe34:3672:22)
    at Object.invokeGuardedCallbackDev (react-dom_client.js?v=a1cfbe34:3697:24)
    at invokeGuardedCallback (react-dom_client.js?v=a1cfbe34:3731:39)
    at beginWork$1 (react-dom_client.js?v=a1cfbe34:19763:15)
    at performUnitOfWork (react-dom_client.js?v=a1cfbe34:19199:20)
react-dom_client.js?v=a1cfbe34:14030 The above error occurred in the <Crafting> component:

    at Crafting (http://localhost:5173/src/components/Crafting.jsx?t=1776119099450:66:36)
    at Suspense
    at TabErrorBoundary (http://localhost:5173/src/App.jsx?t=1776119127547:17:5)
    at main
    at div
    at div
    at App (http://localhost:5173/src/App.jsx?t=1776119127547:147:31)

React will try to recreate this component tree from scratch using the error boundary you provided, TabErrorBoundary.
logCapturedError @ react-dom_client.js?v=a1cfbe34:14030
App.jsx:28 Tab render error: Forja ReferenceError: Cannot access 'selectedItem' before initialization
    at Crafting (Crafting.jsx:144:23)
    at renderWithHooks (react-dom_client.js?v=a1cfbe34:11546:26)
    at updateFunctionComponent (react-dom_client.js?v=a1cfbe34:14580:28)
    at mountLazyComponent (react-dom_client.js?v=a1cfbe34:14831:23)
    at beginWork (react-dom_client.js?v=a1cfbe34:15916:22)
    at beginWork$1 (react-dom_client.js?v=a1cfbe34:19751:22)
    at performUnitOfWork (react-dom_client.js?v=a1cfbe34:19199:20)
    at workLoopSync (react-dom_client.js?v=a1cfbe34:19135:13)
    at renderRootSync (react-dom_client.js?v=a1cfbe34:19114:15)
    at recoverFromConcurrentError (react-dom_client.js?v=a1cfbe34:18734:28)
componentDidCatch @ App.jsx:28
Crafting.jsx:144 Uncaught ReferenceError: Cannot access 'selectedItem' before initialization
    at Crafting (Crafting.jsx:144:23)
    at renderWithHooks (react-dom_client.js?v=a1cfbe34:11546:26)
    at updateFunctionComponent (react-dom_client.js?v=a1cfbe34:14580:28)
    at mountLazyComponent (react-dom_client.js?v=a1cfbe34:14831:23)
    at beginWork (react-dom_client.js?v=a1cfbe34:15916:22)
    at HTMLUnknownElement.callCallback2 (react-dom_client.js?v=a1cfbe34:3672:22)
    at Object.invokeGuardedCallbackDev (react-dom_client.js?v=a1cfbe34:3697:24)
    at invokeGuardedCallback (react-dom_client.js?v=a1cfbe34:3731:39)
    at beginWork$1 (react-dom_client.js?v=a1cfbe34:19763:15)
    at performUnitOfWork (react-dom_client.js?v=a1cfbe34:19199:20)
Crafting.jsx:144 Uncaught ReferenceError: Cannot access 'selectedItem' before initialization
    at Crafting (Crafting.jsx:144:23)
    at renderWithHooks (react-dom_client.js?v=a1cfbe34:11546:26)
    at updateFunctionComponent (react-dom_client.js?v=a1cfbe34:14580:28)
    at mountLazyComponent (react-dom_client.js?v=a1cfbe34:14831:23)
    at beginWork (react-dom_client.js?v=a1cfbe34:15916:22)
    at HTMLUnknownElement.callCallback2 (react-dom_client.js?v=a1cfbe34:3672:22)
    at Object.invokeGuardedCallbackDev (react-dom_client.js?v=a1cfbe34:3697:24)
    at invokeGuardedCallback (react-dom_client.js?v=a1cfbe34:3731:39)
    at beginWork$1 (react-dom_client.js?v=a1cfbe34:19763:15)
    at performUnitOfWork (react-dom_client.js?v=a1cfbe34:19199:20)
react-dom_client.js?v=a1cfbe34:14030 The above error occurred in the <Crafting> component:

    at Crafting (http://localhost:5173/src/components/Crafting.jsx?t=1776119099450:66:36)
    at Suspense
    at TabErrorBoundary (http://localhost:5173/src/App.jsx?t=1776119127547:17:5)
    at main
    at div
    at div
    at App (http://localhost:5173/src/App.jsx?t=1776119127547:147:31)

React will try to recreate this component tree from scratch using the error boundary you provided, TabErrorBoundary.
logCapturedError @ react-dom_client.js?v=a1cfbe34:14030
App.jsx:28 Tab render error: Forja ReferenceError: Cannot access 'selectedItem' before initialization
    at Crafting (Crafting.jsx:144:23)
    at renderWithHooks (react-dom_client.js?v=a1cfbe34:11546:26)
    at updateFunctionComponent (react-dom_client.js?v=a1cfbe34:14580:28)
    at mountLazyComponent (react-dom_client.js?v=a1cfbe34:14831:23)
    at beginWork (react-dom_client.js?v=a1cfbe34:15916:22)
    at beginWork$1 (react-dom_client.js?v=a1cfbe34:19751:22)
    at performUnitOfWork (react-dom_client.js?v=a1cfbe34:19199:20)
    at workLoopSync (react-dom_client.js?v=a1cfbe34:19135:13)
    at renderRootSync (react-dom_client.js?v=a1cfbe34:19114:15)
    at recoverFromConcurrentError (react-dom_client.js?v=a1cfbe34:18734:28)
componentDidCatch @ App.jsx:28
