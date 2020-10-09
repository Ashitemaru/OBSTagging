.open dbn.db
delete from problem;
.separator "\t" "\n"
.import dataprocess/tmp.csv problem
