import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateContentDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsString()
  preview: string;

  @IsString()
  fullContent: string;

  @IsString()
  basePrice: string; // wei

  @IsString()
  priceUsd: string;

  @IsString()
  @IsOptional()
  creatorName?: string;

  @IsString()
  @IsOptional()
  metadataURI?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

