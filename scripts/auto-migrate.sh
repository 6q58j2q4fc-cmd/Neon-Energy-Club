#!/bin/bash
# Automated database migration script that answers all prompts with "create column"

cd /home/ubuntu/neon-energy-preorder

# Use expect to automate the interactive prompts
expect << 'EOF'
set timeout 300
spawn pnpm db:push

# Answer all column creation prompts with Enter (default is create column)
expect {
    "created or renamed" {
        send "\r"
        exp_continue
    }
    "drizzle-kit migrate" {
        # Migration complete
    }
    timeout {
        puts "Timeout waiting for prompt"
        exit 1
    }
    eof
}
EOF

echo "Migration complete!"
