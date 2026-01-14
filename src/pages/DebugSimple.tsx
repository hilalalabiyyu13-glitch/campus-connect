import { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DebugPage() {
  const { user } = useAuth();
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDebug = async () => {
      if (!user) {
        setDebugData({ error: 'No user logged in' });
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const debugInfo: any = {
        timestamp: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email
        }
      };

      console.group('🔍 STARTING DEBUG SESSION');
      console.log('User Info:', debugInfo.user);

      try {
        // 1. Check User Reports
        console.log('\n📄 Step 1: Checking User Reports...');
        const { data: reportsData, error: reportsError } = await supabase
          .from('laporan')
          .select('*')
          .eq('pengguna_id', user.id);
        
        console.log('Reports Data:', reportsData);
        console.log('Reports Error:', reportsError);
        debugInfo.reports = reportsData;

        // 2. Check All Claims
        console.log('\n📋 Step 2: Checking All Claims...');
        const { data: allClaimsData, error: allClaimsError } = await supabase
          .from('klaim')
          .select('*')
          .order('dibuat_pada', { ascending: false });
        
        console.log('All Claims Data:', allClaimsData);
        console.log('All Claims Error:', allClaimsError);
        debugInfo.allClaims = allClaimsData;

        // 3. Check RLS Policies
        console.log('\n📜 Step 3: Checking RLS Policies...');
        try {
          const { data: policiesData } = await supabase
            .rpc('get_policies_info'); // Try RPC function
            
          console.log('RLS Policies (via RPC):', policiesData);
        } catch (rpcError) {
          console.log('RPC not available, trying direct query...');
          try {
            // Fallback: Try to get policies info directly
            const { data: directData } = await supabase
              .from('information_schema.table_privileges')
              .select('*')
              .eq('table_name', 'klaim');
            
            console.log('Direct policies query:', directData);
          } catch (directError) {
            console.log('Direct query failed:', directError);
          }
        }

        // 4. Analyze ownership and claims
        if (reportsData && allClaimsData) {
          console.log('\n🔍 Step 4: Analyzing Ownership & Claims...');
          
          const reportIds = reportsData.map((r: any) => r.id);
          const userReports = reportsData.filter((r: any) => r.jenis_laporan === 'Ditemukan');
          
          console.log('User Report IDs:', reportIds);
          console.log('Reports that can be claimed:', userReports);
          
          const claimsOnUserReports = allClaimsData.filter((claim: any) => 
            reportIds.includes(claim.laporan_ditemukan_id)
          );
          
          console.log('Claims on User Reports:', claimsOnUserReports);
          console.log('Claims Analysis:', {
            totalClaims: allClaimsData.length,
            claimsOnUserReports: claimsOnUserReports.length,
            reportCount: reportsData.length,
            claimableReports: userReports.length
          });
          
          debugInfo.analysis = {
            totalClaims: allClaimsData.length,
            claimsOnUserReports: claimsOnUserReports.length,
            reportCount: reportsData.length,
            claimableReports: userReports.length,
            reportIds,
            claimsOnUserReports
          };

          // 5. Test Update Permission
          if (claimsOnUserReports.length > 0) {
            console.log('\n🧪 Step 5: Testing Update Permission...');
            const testClaim = claimsOnUserReports[0];
            console.log('Testing claim update for:', testClaim);
            
            // Test if user can update this claim
            const { data: updateTest, error: updateError } = await supabase
              .from('klaim')
              .update({ status_klaim: 'TEST_STATUS' })
              .eq('id', testClaim.id)
              .select();
            
            console.log('Update Test Result:', { updateTest, updateError });
            
            if (updateError) {
              console.error('❌ USER CANNOT UPDATE CLAIM:', updateError);
              debugInfo.updatePermission = false;
            } else {
              console.log('✅ USER CAN UPDATE CLAIM!');
              debugInfo.updatePermission = true;
              
              // Rollback
              await supabase
                .from('klaim')
                .update({ status_klaim: testClaim.status_klaim || 'Menunggu' })
                .eq('id', testClaim.id);
            }
          }
        }

        setDebugData(debugInfo);

      } catch (error) {
        console.error('🚨 DEBUG ERROR:', error);
        setDebugData({ error: error.message });
      } finally {
        setLoading(false);
        console.log('🏁 DEBUG SESSION COMPLETED');
        console.groupEnd();
      }
    };

    runDebug();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch={false} />
      
      <main className="container px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">🔍 Debug: Klaim Approval System</h1>
        
        {loading ? (
          <div className="text-center py-8">Running diagnostics...</div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Debug Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {debugData?.error ? (
                  <div className="text-red-600">
                    <p><strong>Error:</strong> {debugData.error}</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p><strong>Reports:</strong> {debugData.reports?.length || 0}</p>
                      <p><strong>Ditemukan:</strong> {debugData.reports?.filter((r: any) => r.jenis_laporan === 'Ditemukan').length || 0}</p>
                    </div>
                    <div>
                      <p><strong>All Claims:</strong> {debugData.allClaims?.length || 0}</p>
                      <p><strong>Claims on Your Reports:</strong> {debugData.analysis?.claimsOnUserReports || 0}</p>
                    </div>
                    <div>
                      <p><strong>Update Permission:</strong></p>
                      <p className={`font-bold ${debugData.analysis?.updatePermission ? 'text-green-600' : 'text-red-600'}`}>
                        {debugData.analysis?.updatePermission ? '✅ ALLOWED' : '❌ DENIED'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Checks */}
            <Card>
              <CardHeader>
                <CardTitle>🔍 Quick Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold mb-2">1. User Punya Laporan Ditemukan?</h3>
                    <p>Jawab harus: <strong>YA</strong> untuk bisa ada klaim</p>
                    <p>Status: {debugData.analysis?.claimableReports > 0 ? '✅ ADA' : '❌ TIDAK ADA'}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold mb-2">2. Ada Orang Lain Mengajukan Klaim?</h3>
                    <p>Harus ada klaim dari user lain pada barang Anda</p>
                    <p>Status: {debugData.analysis?.claimsOnUserReports > 0 ? '✅ ADA' : '❌ BELUM ADA'}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold mb-2">3. Permission Update Klaim?</h3>
                    <p>Test update claim yang menunggu</p>
                    <p>Status: {debugData.analysis?.updatePermission ? '✅ BOLEH' : '❌ TIDAK BOLEH'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Cara Cek Manual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-bold">Jika halaman "Klaim pada Laporan Saya" kosong:</h4>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>1. Buka Browser Console (F12)</li>
                      <li>2. Refresh halaman ini</li>
                      <li>3. Lihat "Debug Summary" di atas</li>
                      <li>4. Jika "Claims on Your Reports" = 0, berarti tidak ada yang klaim barang Anda</li>
                      <li>5. Jika > 0 tapi "Update Permission" = "TIDAK BOLEH", ada masalah RLS policy</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-bold">Jika RLS Policy Error:</h4>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>1. Pastikan SQL script dari <code>update_policy.sql</code> sudah dijalankan</li>
                      <li>2. Cek error message di Supabase SQL Editor</li>
                      <li>3. Pastikan tidak ada policy lain yang conflict</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Link back */}
        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <a href="/klaim-laporan-saya">← Kembali ke Halaman Klaim</a>
          </Button>
        </div>
      </main>
    </div>
  );
}