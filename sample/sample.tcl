puts x 1;# this is a comment
# this is a comment

backslash test \
test1 \

0 1 2 2.3 3.4 

puts strwef\u20ACefe\477fefef\nefefe\043fe\x22fing
puts "strwef\u20ACefe\177fefef\nefefe\043fe\x22fing"

puts "\g\x\k\"\'\\\x20Hello\40World!"
puts [format "%d decimal is %x hex" 255 255]

puts "%d decimal is %x hex" 255 255

"string"
"string"

if 0 {   this is a comment \
    this is also a comment
}

proc # args {}
{#} fefefe 123 sbcd fefe efefe ;
{#} 123wdwdwdwdwdwdwdw  ;


proc # args {}
{#}{
   ##efefefefe
    efefefe
    efefeff
efeefef}
    
{#} efefefe;


list element1 \
{*}[
    #test
    if t { puts Hello }
    #test
] element2 \
element3 


# Set up the column widths
set w1 5
set w2 10

# Make a nice header (with separator) for the table first
set sep +-[string repeat - $w1]-+-[string repeat - $w2]-+
puts $sep
puts [format "| %-*s | %-*s |" $w1 "Index" $w2 "Power"]
puts $sep

# Print the contents of the table
set p 1
for {set i 0} {$i<=20} {incr i} {
   puts [format "| %*d | %*ld |" $w1 $i $w2 $p]
   set p [expr {wide($p) * 3}]
}

# Finish off by printing the separator again
puts $sep