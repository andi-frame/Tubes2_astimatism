import React from "react";

type RecipeStep = {
  element1: string;
  element2: string;
  result: string;
};

type RecipePathProps = {
  path: RecipeStep[];
  className?: string;
};

export default function RecipePath({ path, className = "" }: RecipePathProps) {
  if (!path || path.length === 0) return null;

  return (
    <div></div>
  );
}