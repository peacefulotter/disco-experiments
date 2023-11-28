import { NextRequest, NextResponse } from 'next/server'

export const config = {
    matcher: '/api/wasm/:file*',
}

export function middleware(request: NextRequest) {
    console.log('HERE MIDDLEWARE')

    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    //     const cspHeader = `
    //     default-src 'self';
    //     script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    //     style-src 'self' 'nonce-${nonce}';
    //     img-src 'self' blob: data:;
    //     font-src 'self';
    //     object-src 'none';
    //     base-uri 'self';
    //     form-action 'self';
    //     frame-ancestors 'none';
    //     block-all-mixed-content;
    //     upgrade-insecure-requests;
    // `
    const cspHeader = ''
    // Replace newline characters and spaces
    const contentSecurityPolicyHeaderValue = cspHeader
        .replace(/\s{2,}/g, ' ')
        .trim()

    const requestHeaders = new Headers(request.headers)
    // requestHeaders.set('x-nonce', nonce)

    // requestHeaders.set(
    //     'Content-Security-Policy',
    //     contentSecurityPolicyHeaderValue
    // )
    requestHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp')
    requestHeaders.set('Cross-Origin-Opener-Policy', 'same-origin')

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })
    // response.headers.set(
    //     'Content-Security-Policy',
    //     contentSecurityPolicyHeaderValue
    // )
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')

    return response
}
