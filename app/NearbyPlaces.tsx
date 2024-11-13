"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNearbyPlaces } from "./useNearbyPlaces";

export default function Content() {
  const [radius, setRadius] = useState(10);
  const [searchTerms, setSearchTerms] = useState("");

  const [search, { searching, error, places, locationTimestamp }] =
    useNearbyPlaces();
  return (
    <div className="grid grid-rows-[auto_1fr_auto] border rounded-sm">
      <header className="flex items-center justify-center gap-2 p-2">
        <Input
          type="text"
          placeholder="Search terms"
          onChange={handleInputChange}
        />
        <Slider
          className="w-40"
          defaultValue={[25]}
          min={1}
          max={100}
          step={1}
          value={[radius]}
          onValueChange={handleSliderChange}
        />
        <Button onClick={handleSearch}>Search</Button>
      </header>
      <main className="grid p-2 border-y">
        <Card className="grid grid-rows-[auto_1fr]">
          <CardHeader>
            <CardTitle className="grid grid-cols-[1fr_auto]">
              <p>
                {searchTerms} within {radius}km
              </p>
              <div className="flex items-center gap-1">
                {locationTimestamp && (
                  <p className="text-xs text-emerald-600">GPS</p>
                )}
                {searching && (
                  <p className="text-xs text-blue-600 animate-pulse">
                    SEARCHING
                  </p>
                )}
              </div>
            </CardTitle>
            {error && (
              <CardDescription className="text-destructive">
                {error}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="overflow-x-hidden">
            <pre className="text-xs bg-foreground text-background p-2 rounded-sm h-full overflow-x-auto">
              <code>{JSON.stringify(places, null, 2)}</code>
            </pre>
          </CardContent>
        </Card>
      </main>
      <footer className="grid place-content-center p-2">
        <a
          className="text-orange-600 hover:underline hover:brightness-110"
          href="https://github.com/patsissons/usenearbyplaces"
        >
          github source
        </a>
      </footer>
    </div>
  );

  function handleSliderChange([radius]: number[]) {
    setRadius(radius);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerms(e.target.value);
  }

  function handleSearch() {
    search({ searchTerms, radius });
  }
}
