require 'rubygems'
require 'imgur'
require 'open-uri'
require 'json'

album_path = "http://reactiongifsarchive.imgur.com/"

# Find all subalbums within this album, noting their tags
disgust_album_id = "AXues"
clapping_album_id = "NzuZS"

@client = Imgur.new('ebf4e49184f1edd')
@gifs   = []

# Extract all images from sub album
def extract_images_from_album(album_url, tag)
  album = @client.get_album('AXues')
  puts "Extracting from album '#{album.title}' with tag '#{tag}...'"

  album.images.each_with_index do |image, index|
    gif_id = image.link.match(/http:\/\/i\.imgur\.com\/([A-Za-z0-9]+)\.gif/)[1]

    gif_data = {}
    gif_data['id'] = gif_id
    gif_data['tag'] = tag
    gif_data['link'] = image.link
    @gifs << gif_data

    # Copy the files to make them local
    open("./gifs/#{gif_id}.gif", "wb") do |file|
      file << open(gif_data['link']).read
    end
    open("./gifs/#{gif_id}s.jpg", "wb") do |file|
      file << open( image.link.gsub(".gif", "s.jpg") ).read
    end

    puts "  #{index} / #{album.images.size}"
  end
end

extract_images_from_album(disgust_album_id, "disgust")
extract_images_from_album(clapping_album_id, "clapping")

# Output the result
IO.write("./metagif.json", @gifs.to_json)




