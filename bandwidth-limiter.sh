#!/bin/bash

# Reset dummynet to default config
dnctl -f flush

pfctl -F all

# Compose an addendum to the default config; creates a new anchor
(cat /etc/pf.conf &&
  echo 'dummynet-anchor "my_anchor"' &&
  echo 'anchor "my_anchor"') | pfctl -q -f -

# Configure the new anchor
cat <<EOF | pfctl -q -a my_anchor -f -
no dummynet quick on lo0 all
dummynet out all pipe 1
dummynet out proto icmp all pipe 2
dummynet out proto tcp to any port 443 pipe 2
dummynet out proto tcp to any port 80 pipe 2
dummynet out proto tcp to any port 22 pipe 2
EOF

# Create the dummynet queue
dnctl pipe 1 config bw 256Kbyte/s queue 50
dnctl pipe 2 config queue 50

# Activate PF
pfctl -E