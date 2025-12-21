import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Upload, Film, Image, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createCompleteMovie } from "~/services/movieService";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Upload Movie - Admin - CineCircle" },
    { name: "description", content: "Upload a new movie to CineCircle" },
  ];
};

export default function MovieUpload() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    director: "",
    producer: "",
    writer: "",
    releaseYear: "",
    releaseDate: "",
    durationMinutes: "",
    language: "",
    country: "",
    genre: "",
    rating: "",
    imdbRating: "",
    rottenTomatoesScore: "",
    boxOfficeGross: "",
    budget: "",
    awards: "",
    synopsis: "",
    trivia: "",
    isFeatured: false,
  });

  const [files, setFiles] = useState<{
    video: File | null;
    poster: File | null;
    banner: File | null;
  }>({
    video: null,
    poster: null,
    banner: null,
  });

  const [uploadProgress, setUploadProgress] = useState({
    video: 0,
    poster: 0,
    banner: 0,
  });

  const videoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!files.video) {
        throw new Error("Video file is required");
      }

      const movieData = {
        ...formData,
        releaseYear: formData.releaseYear ? parseInt(formData.releaseYear) : undefined,
        durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : undefined,
        imdbRating: formData.imdbRating ? parseFloat(formData.imdbRating) : undefined,
        rottenTomatoesScore: formData.rottenTomatoesScore ? parseFloat(formData.rottenTomatoesScore) : undefined,
      };

      return createCompleteMovie(
        movieData,
        {
          video: files.video,
          poster: files.poster || undefined,
          banner: files.banner || undefined,
        }
      );
    },
    onSuccess: (data) => {
      console.log("Movie uploaded successfully:", data);
      // Navigate to movie detail page or admin dashboard
      navigate(`/movies/${data.movie.title}`);
    },
    onError: (error: any) => {
      console.error("Failed to upload movie:", error);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (type: 'video' | 'poster' | 'banner') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({
        ...prev,
        [type]: file,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload New Movie</h1>
          <p className="text-muted-foreground">
            Upload a complete movie with video, poster, and banner images
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Uploads Section */}
          <Card>
            <CardHeader>
              <CardTitle>Media Files</CardTitle>
              <CardDescription>Upload video, poster, and banner images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Upload */}
              <div>
                <Label htmlFor="video" className="flex items-center gap-2 mb-2">
                  <Film className="h-4 w-4" />
                  Video File *
                </Label>
                <input
                  ref={videoInputRef}
                  type="file"
                  id="video"
                  accept="video/mp4,video/avi,video/mov,video/mkv,video/webm"
                  onChange={handleFileChange('video')}
                  className="hidden"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full justify-start"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {files.video ? files.video.name : 'Select Video File'}
                </Button>
                {files.video && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(files.video.size)}
                    </span>
                    <Badge variant="secondary">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Selected
                    </Badge>
                  </div>
                )}
              </div>

              {/* Poster Upload */}
              <div>
                <Label htmlFor="poster" className="flex items-center gap-2 mb-2">
                  <Image className="h-4 w-4" />
                  Poster Image
                </Label>
                <input
                  ref={posterInputRef}
                  type="file"
                  id="poster"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange('poster')}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => posterInputRef.current?.click()}
                  className="w-full justify-start"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {files.poster ? files.poster.name : 'Select Poster Image'}
                </Button>
                {files.poster && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(files.poster.size)}
                    </span>
                    <Badge variant="secondary">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Selected
                    </Badge>
                  </div>
                )}
              </div>

              {/* Banner Upload */}
              <div>
                <Label htmlFor="banner" className="flex items-center gap-2 mb-2">
                  <Image className="h-4 w-4" />
                  Banner Image
                </Label>
                <input
                  ref={bannerInputRef}
                  type="file"
                  id="banner"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange('banner')}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => bannerInputRef.current?.click()}
                  className="w-full justify-start"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {files.banner ? files.banner.name : 'Select Banner Image'}
                </Button>
                {files.banner && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(files.banner.size)}
                    </span>
                    <Badge variant="secondary">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Selected
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div>
                <Label htmlFor="synopsis">Synopsis</Label>
                <textarea
                  id="synopsis"
                  name="synopsis"
                  value={formData.synopsis}
                  onChange={handleInputChange}
                  className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="director">Director</Label>
                  <Input
                    id="director"
                    name="director"
                    value={formData.director}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="producer">Producer</Label>
                  <Input
                    id="producer"
                    name="producer"
                    value={formData.producer}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="writer">Writer</Label>
                <Input
                  id="writer"
                  name="writer"
                  value={formData.writer}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="genre">Genre (comma-separated)</Label>
                  <Input
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    placeholder="Action, Drama, Thriller"
                  />
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="rating">Rating (PG, PG-13, R, etc.)</Label>
                  <Input
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Release and Duration */}
          <Card>
            <CardHeader>
              <CardTitle>Release Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="releaseYear">Release Year</Label>
                  <Input
                    id="releaseYear"
                    name="releaseYear"
                    type="number"
                    value={formData.releaseYear}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="releaseDate">Release Date</Label>
                  <Input
                    id="releaseDate"
                    name="releaseDate"
                    type="date"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                <Input
                  id="durationMinutes"
                  name="durationMinutes"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ratings and Financial */}
          <Card>
            <CardHeader>
              <CardTitle>Ratings & Financial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imdbRating">IMDB Rating (0-10)</Label>
                  <Input
                    id="imdbRating"
                    name="imdbRating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.imdbRating}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="rottenTomatoesScore">Rotten Tomatoes Score (0-100)</Label>
                  <Input
                    id="rottenTomatoesScore"
                    name="rottenTomatoesScore"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.rottenTomatoesScore}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="boxOfficeGross">Box Office Gross</Label>
                  <Input
                    id="boxOfficeGross"
                    name="boxOfficeGross"
                    value={formData.boxOfficeGross}
                    onChange={handleInputChange}
                    placeholder="$100,000,000"
                  />
                </div>

                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="$50,000,000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="awards">Awards</Label>
                <Input
                  id="awards"
                  name="awards"
                  value={formData.awards}
                  onChange={handleInputChange}
                  placeholder="Academy Award Winner"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="trivia">Trivia</Label>
                <textarea
                  id="trivia"
                  name="trivia"
                  value={formData.trivia}
                  onChange={handleInputChange}
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Feature this movie on the homepage
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={uploadMutation.isPending || !files.video}
              className="min-w-[150px]"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Movie
                </>
              )}
            </Button>
          </div>

          {/* Upload Status */}
          {uploadMutation.isPending && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uploading...</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Please wait while your movie is being uploaded and processed. This may take several minutes.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {uploadMutation.isError && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Upload Failed</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {uploadMutation.error?.message || 'An error occurred while uploading the movie'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}
