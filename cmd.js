#!/usr/bin/env node
require('dotenv').config();
const runInquirer = require('./docker')

// Run
runInquirer()