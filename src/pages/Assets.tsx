import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchBinanceBalances } from "@/lib/binance";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Assets = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your assets.",
          variant: "destructive",
        });
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate, toast]);

  const { data: assets, isLoading, error } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      try {
        // First, fetch from Binance API and update database
        await fetchBinanceBalances();
        
        // Then fetch from our database
        const { data, error } = await supabase
          .from("assets")
          .select("*")
          .order("symbol");

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching assets:", error);
        toast({
          title: "Error",
          description: "Failed to fetch assets. Please try again later.",
          variant: "destructive",
        });
        throw error;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const spotAssets = assets?.filter((asset) => asset.account_type === "spot") || [];
  const marginAssets = assets?.filter((asset) => asset.account_type === "margin") || [];

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar />
          <main className="flex-1 p-4 md:p-8">
            <div className="container mx-auto max-w-7xl">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <Skeleton className="h-8 w-32" />
                <SidebarTrigger className="md:hidden" />
              </div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar />
          <main className="flex-1 p-4 md:p-8">
            <div className="container mx-auto max-w-7xl">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold">Assets</h1>
                <SidebarTrigger className="md:hidden" />
              </div>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-destructive">Failed to load assets. Please try refreshing the page.</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <main className="flex-1 p-4 md:p-8">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold">Assets</h1>
              <SidebarTrigger className="md:hidden" />
            </div>

            <Tabs defaultValue="spot" className="space-y-4">
              <TabsList>
                <TabsTrigger value="spot">Spot Account</TabsTrigger>
                <TabsTrigger value="margin">Margin Account</TabsTrigger>
              </TabsList>

              <TabsContent value="spot">
                <Card>
                  <CardHeader>
                    <CardTitle>Spot Assets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AssetsTable assets={spotAssets} isLoading={isLoading} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="margin">
                <Card>
                  <CardHeader>
                    <CardTitle>Margin Assets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AssetsTable assets={marginAssets} isLoading={isLoading} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const AssetsTable = ({ assets, isLoading }: { assets: any[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!assets.length) {
    return <p className="text-muted-foreground">No assets found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead className="text-right">Available</TableHead>
          <TableHead className="text-right">Locked</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.map((asset) => (
          <TableRow key={`${asset.symbol}-${asset.account_type}`}>
            <TableCell className="font-medium">{asset.symbol}</TableCell>
            <TableCell className="text-right">{parseFloat(asset.free).toFixed(8)}</TableCell>
            <TableCell className="text-right">{parseFloat(asset.locked).toFixed(8)}</TableCell>
            <TableCell className="text-right">
              {(parseFloat(asset.free) + parseFloat(asset.locked)).toFixed(8)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default Assets;