beam(1) -- Sync a directory or file to an s3 bucket
===================================================

## SYNOPSIS

    beam [dirname] --bucket <bucket> --key <key>  --secret <secret>
    beam [filename] --bucket <bucket> --key <key>  --secret <secret>

## DESCRIPTION

Upload directories and files to an S3 bucket.

If objects exist in the bucket that are not in the local directory they will be deleted.

Object names will be chosen relatively to the `dirname` argument so that if you `beam foo` when the program uploads the local file `foo/bar.html` it will choose '/bar.html' as the object name (url) when issuing the PUT request to s3. If you are are uploading a single file the `cwd` will be used as the `dirname` unless you explicitly define it with the `--dirname` option. This will prevent an s3 object from being named /foo/bar.html when you meant it to be just /bar.html.

## OPTIONS

--bucket, -b [bucket]

  The s3 bucket to upload objects to.

--key, -k [key]

  The AWS key to use for authentication.

--secret, -s [secret]

  The AWS secret to use for authentication.

--region, -r <region>

  AWS region/zone to use, defaults to us-west-1

--dirname, --dir, -d <dirname>

  The `dirname` to use as the root when uploading single files.

--header, -h <header>

  Sets a header for each object's PUT request being sent to s3, it's possible to set more than one and override the for: 'x-amz-acl: public-read' and 'cache-control: max-age=31536000, public'.

--gzip, -g
--no-gzip, -ng

  Turn gzipping on or off, defaults to true (on).

--mime, -m <media-type:extenions>

  Define extra media-types. If an unknown media-type is encountered when looking up a files extension it will be set to 'aplication/octet-stream' by default. If this is undesired use `--mime` to add a mapping. For example `--mime text/x-markdown:md,markdown` will use the content type "text/x-markdown" for md, and markdown extensions.

## DISCUSSION

This tool was initially developed for sending files in a local directory to s3 buckets for serving publicly accessible, static websites. All the default options will serve this purpose well. If you do not want to treat all the files the same you can change the options on your specific files.

When sending directories if an object in the bucket doesn't exist in the local directory it will be removed from the s3 bucket. The `beam` command treats the local directory as the authority for what the current state of the s3 bucket should be when it is run.

## SEE ALSO

* beam-config(1)
