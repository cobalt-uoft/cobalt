# fix nyc coverage pathname bug (https://github.com/bcoe/nyc/issues/110)
while (<>) {
  $_ =~ s/\.\/.*?cobalt\//\.\//g;
  print $_;
}
