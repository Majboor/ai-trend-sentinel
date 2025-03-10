import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { VideoCard } from "./VideoCard";
import { SentimentStats } from "./SentimentStats";
import type { SentimentData } from "./types";

type SentimentFilter = "all" | "buy" | "sell" | "others";

export function CoinSentimentView() {
  const [selectedCoin, setSelectedCoin] = useState<string>("");
  const [availableCoins, setAvailableCoins] = useState<string[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all");
  const { toast } = useToast();

  // Fetch available coins only once when component mounts
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoadingCoins(true);
        const response = await fetch('https://crypto.techrealm.pk/coin/search');
        if (!response.ok) {
          throw new Error('Failed to fetch coins');
        }
        const data = await response.json();
        if (data.coins && Array.isArray(data.coins)) {
          setAvailableCoins(data.coins);
          // Only set initial selected coin if we have coins and none is selected
          if (data.coins.length > 0 && !selectedCoin) {
            setSelectedCoin(data.coins[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching coins:', error);
        toast({
          title: "Error",
          description: "Failed to fetch available coins. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoadingCoins(false);
      }
    };

    fetchCoins();
  }, [toast]);

  // Fetch sentiment data only when a coin is selected
  useEffect(() => {
    const fetchSentimentData = async () => {
      if (!selectedCoin) return;
      
      try {
        setLoading(true);
        setSentimentData(null); // Clear previous data
        
        const response = await fetch(`https://crypto.techrealm.pk/coin/${selectedCoin}`);
        if (!response.ok) {
          throw new Error('Failed to fetch sentiment data');
        }
        const data = await response.json();
        setSentimentData(data);
      } catch (error) {
        console.error('Error fetching sentiment data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch sentiment data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (selectedCoin) {
      fetchSentimentData();
    }
  }, [selectedCoin, toast]);

  const calculateSentiments = () => {
    if (!sentimentData?.videos) return { buy: 0, sell: 0, others: 0, total: 0 };

    let buy = 0, sell = 0, others = 0;

    Object.values(sentimentData.videos).forEach(video => {
      video.comments.forEach(comment => {
        if (comment.indicator === 'buy') buy++;
        else if (comment.indicator === 'sell') sell++;
        else others++;
      });
    });

    const total = buy + sell + others;
    return { buy, sell, others, total };
  };

  if (loadingCoins) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="mb-6">
          <label htmlFor="coin-select" className="block text-sm font-medium mb-2">
            Select Coin
          </label>
          <Select value={selectedCoin} onValueChange={setSelectedCoin}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a coin" />
            </SelectTrigger>
            <SelectContent>
              {availableCoins.map((coin) => (
                <SelectItem key={coin} value={coin}>
                  {coin}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <Label className="text-sm font-medium mb-2">Filter Comments</Label>
          <RadioGroup
            defaultValue="all"
            value={sentimentFilter}
            onValueChange={(value) => setSentimentFilter(value as SentimentFilter)}
            className="flex space-x-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="buy" id="buy" />
              <Label htmlFor="buy" className="text-green-500">Buy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sell" id="sell" />
              <Label htmlFor="sell" className="text-red-500">Sell</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="others" id="others" />
              <Label htmlFor="others" className="text-yellow-500">Others</Label>
            </div>
          </RadioGroup>
        </div>

        <SentimentStats loading={loading} stats={calculateSentiments()} />
      </div>

      {sentimentData && Object.entries(sentimentData.videos).map(([videoId, video]) => (
        <VideoCard 
          key={videoId} 
          videoId={videoId} 
          video={video} 
          sentimentFilter={sentimentFilter}
        />
      ))}
    </div>
  );
}