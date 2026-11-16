import Link from 'next/link';

export default function LearningSection() {
  return (
    <div className="border-t-4 border-yellow-400 pt-8 mt-12">
      <div className="card bg-yellow-50 border border-yellow-300 mb-6">
        <div className="flex items-start">
          <div className="text-3xl mr-4">🎓</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-yellow-900 mb-2">
              Learning: Vulnerability Scenarios
            </h3>
            <p className="text-yellow-800 mb-4">
              Sebagai user biasa, seharusnya Anda <strong>TIDAK</strong> punya izin melakukan aksi tertentu terhadap resource user lain maupun admin.
              Namun, aplikasi ini memiliki vulnerability yang bisa di-exploit untuk pembelajaran.
            </p>
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> Section ini hanya untuk tujuan pembelajaran BAC (Broken Access Control).
              Dalam aplikasi real, vulnerability ini tidak boleh ada!
            </p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-6">🔓 Explore Vulnerabilities:</h3>

      <div className="space-y-6">
        {/* BAC Vulnerabilities */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Broken Access Control (BAC)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Skenario 0.0 - BAC SSR */}
            <Link href="/user/scenario-0.0" className="card hover:shadow-xl transition-shadow cursor-pointer border-2 border-red-300">
              <div className="flex items-start mb-4">
                <div className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-4">
                  0.0
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-600 mb-2">BAC - SSR</h3>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">VULNERABLE</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Server-Side Rendering Vulnerability</strong>
              </p>
              <p className="text-xs text-gray-600">
                Endpoint tidak memiliki authorization check yang proper.
              </p>
            </Link>

            {/* Skenario 0.1 - BAC CSR */}
            <Link href="/user/scenario-0.1" className="card hover:shadow-xl transition-shadow cursor-pointer border-2 border-orange-300">
              <div className="flex items-start mb-4">
                <div className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-4">
                  0.1
                </div>
                <div>
                  <h3 className="text-lg font-bold text-orange-600 mb-2">BAC - CSR</h3>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">VULNERABLE</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Client-Side Rendering Vulnerability</strong>
              </p>
              <p className="text-xs text-gray-600">
                Authorization check dilakukan di client-side, bisa dimanipulasi.
              </p>
            </Link>

            {/* Skenario 1.1 - Forced Browsing */}
            <Link href="/user/scenario-1.1" className="card hover:shadow-xl transition-shadow cursor-pointer border-2 border-yellow-300">
              <div className="flex items-start mb-4">
                <div className="bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-4">
                  1.1
                </div>
                <div>
                  <h3 className="text-lg font-bold text-yellow-600 mb-2">Forced Browsing</h3>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">VULNERABLE</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>API Endpoint Vulnerability</strong>
              </p>
              <p className="text-xs text-gray-600">
                Page protected tapi API endpoint masih vulnerable.
              </p>
            </Link>

            {/* Skenario BAC-1 - Unauthorized User Registration */}
            <Link href="/user/scenario-bac-1" className="card hover:shadow-xl transition-shadow cursor-pointer border-2 border-purple-300">
              <div className="flex items-start mb-4">
                <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm mr-4">
                  BAC-1
                </div>
                <div>
                  <h3 className="text-lg font-bold text-purple-600 mb-2">Unauthorized Registration</h3>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">VULNERABLE</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Broken Access Control - User Registration</strong>
              </p>
              <p className="text-xs text-gray-600">
                Endpoint registrasi tidak memvalidasi role, memungkinkan siapa saja mendaftar sebagai admin.
              </p>
            </Link>
          </div>
        </div>

        {/* Cryptographic Vulnerabilities */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Cryptographic Failures</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scenario JWT Weak Secret */}
            <Link href="/user/scenario-jwt" className="card hover:shadow-xl transition-shadow cursor-pointer border-2 border-red-300">
              <div className="flex items-start mb-4">
                <div className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm mr-4">
                  JWT
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-600 mb-2">JWT Weak Secret</h3>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">CRITICAL</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>JWT with Weak Secret Key</strong>
              </p>
              <p className="text-xs text-gray-600">
                JWT menggunakan weak secret yang dapat di-crack, memungkinkan token forgery dan privilege escalation.
              </p>
            </Link>
          </div>
        </div>

        {/* ATO Vulnerabilities */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Account Takeover (ATO)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scenario ATO-1 */}
            <Link href="/user/scenarios/ato-1" className="card hover:shadow-xl transition-shadow cursor-pointer border-2 border-pink-300">
              <div className="flex items-start mb-4">
                <div className="bg-pink-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm mr-4">
                  ATO-1
                </div>
                <div>
                  <h3 className="text-lg font-bold text-pink-600 mb-2">Enumerable ID</h3>
                  <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">VULNERABLE</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Account Takeover via ID Enumeration</strong>
              </p>
              <p className="text-xs text-gray-600">
                Password change endpoint menggunakan ID yang dapat di-enumerate (1, 2, 3...).
              </p>
            </Link>

            {/* Scenario ATO-2 */}
            <Link href="/user/scenarios/ato-2" className="card hover:shadow-xl transition-shadow cursor-pointer border-2 border-indigo-300">
              <div className="flex items-start mb-4">
                <div className="bg-indigo-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm mr-4">
                  ATO-2
                </div>
                <div>
                  <h3 className="text-lg font-bold text-indigo-600 mb-2">Exposed UUID</h3>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">VULNERABLE</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>UUID Exposed in API Response</strong>
              </p>
              <p className="text-xs text-gray-600">
                Admin upgrade ke UUID tapi UUID ter-expose di response API approved_by.
              </p>
            </Link>
          </div>
        </div>

        {/* Injection Vulnerabilities */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Injection</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reflected XSS */}
            <Link href="/user/scenarios/xss-reflected" className="card hover:shadow-xl transition-shadow cursor-pointer border-2 border-rose-300">
              <div className="flex items-start mb-4">
                <div className="bg-rose-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm mr-4">
                  XSS-R
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-600 mb-2">Reflected XSS</h3>
                  <span className="text-xs bg-rose-100 text-rose-800 px-2 py-1 rounded">VULNERABLE</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Reflected Cross-Site Scripting</strong>
              </p>
              <p className="text-xs text-gray-600">
                Nilai query direfleksikan ke halaman tanpa escaping.
              </p>
            </Link>

            {/* Stored XSS */}
            <Link href="/user/scenarios/xss-stored" className="card hover:shadow-xl transition-shadow cursor-pointer border-2 border-red-300">
              <div className="flex items-start mb-4">
                <div className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm mr-4">
                  XSS-S
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-600 mb-2">Stored XSS</h3>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">VULNERABLE</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Stored Cross-Site Scripting</strong>
              </p>
              <p className="text-xs text-gray-600">
                Konten catatan disimpan dan dirender tanpa sanitasi di shared board.
              </p>
            </Link>

            {/* SQL Injection */}
            <Link href="/user/scenarios/sqli" className="card hover:shadow-xl transition-shadow cursor-pointer border-2 border-amber-300">
              <div className="flex items-start mb-4">
                <div className="bg-amber-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm mr-4">
                  SQLI
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-600 mb-2">SQL Injection</h3>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">VULNERABLE</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>SQL Injection</strong>
              </p>
              <p className="text-xs text-gray-600">
                Input pencarian di-concat ke query SQL tanpa parameterized query.
              </p>
            </Link>

            {/* SSRF */}
            <Link href="/user/scenarios/ssrf" className="card hover:shadow-xl transition-shadow cursor-pointer border-2 border-violet-300">
              <div className="flex items-start mb-4">
                <div className="bg-violet-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm mr-4">
                  SSRF
                </div>
                <div>
                  <h3 className="text-lg font-bold text-violet-600 mb-2">SSRF</h3>
                  <span className="text-xs bg-violet-100 text-violet-800 px-2 py-1 rounded">VULNERABLE</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Server-Side Request Forgery</strong>
              </p>
              <p className="text-xs text-gray-600">
                Server fetch URL user tanpa validasi, bisa akses internal service.
              </p>
            </Link>

            {/* Command Injection */}
            <Link href="/user/scenarios/cmdi" className="card hover:shadow-xl transition-shadow cursor-pointer border-2 border-fuchsia-300">
              <div className="flex items-start mb-4">
                <div className="bg-fuchsia-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm mr-4">
                  CMDI
                </div>
                <div>
                  <h3 className="text-lg font-bold text-fuchsia-600 mb-2">Command Injection</h3>
                  <span className="text-xs bg-fuchsia-100 text-fuchsia-800 px-2 py-1 rounded">VULNERABLE</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>OS Command Injection</strong>
              </p>
              <p className="text-xs text-gray-600">
                Input host di-concat ke perintah shell (ping).
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
