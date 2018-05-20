#!/bin/bash

#Import the key value storage script
source src/tester/kv-bash.sh

#The first parameters is the route, 2nd is the option, 3rd is the parameter
route=$1
option=$2
option_params=$3

extension="${route##*.}"
method=""

case $extension in
    post)
        method="POST"
        ;;
    get)
        method="GET"
        ;;
    patch)
        method="PATCH"
        ;;
    delete)
        method="DELETE"
        ;;
esac

if [[ $option = "user" ]]; then
    #user command is for retrieving a token out of storage. 
    #This token should be the token for the user which was specified in $option_params
    #This user will have had their token saved in the `npm run send login/xyz save $user`
    #command.
    bearer_token=`kvget user_$option_params` 
    bearer="-H 'Authorization: Bearer $bearer_token'"
fi

#The resource uri is just the directory before $route
web_route=`dirname $route`
params=`cat src/tester/$route.json`
cmd=`echo curl -s -H "'"Content-Type: application/json"'" $bearer -X $method -d "'"$params"'" localhost:3000/$web_route`

#Evaluate the curl command
echo $cmd
result=`eval $cmd`

#process the options
if  [[ $option = "login" ]]; then
    #`login` is for saving the token due to a login message.
    #The tester is not aware that you are using a login route so the `login` option must be specified
    #explicitly by the user
    #json-extract is a simple javascript file which parses the output json 
    #and returns the specified key. Key could be something like result.0.this.that
    #in this case its really simple and just 'token'
    key="token"
    user_token=`node src/tester/json-extract.js $result $key`
    kvset user_$option_params $user_token 
fi

echo ""
echo "Result:"
echo $result